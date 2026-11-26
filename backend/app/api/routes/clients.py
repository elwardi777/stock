from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_database
from app.core.jwt import require_permission
from app.schemas.clients import (
    CreateClientRequest,
    CreateClientNeedRequest,
    UpdateClientNeedRequest,
)
from app.utils.helpers import serialize_doc, now_utc
from app.utils.audit import log_action
from app.ws import notify_update
from bson import ObjectId
from typing import Optional
import re
import uuid

router = APIRouter()


def _is_own_only_commercial(current_user: dict) -> bool:
    role = (current_user.get("role") or "").lower().strip()
    visibility = current_user.get("visibility_mode") or "own_only"
    return role == "commercial" and visibility == "own_only"


def _assert_client_access(client: dict, current_user: dict) -> None:
    if not _is_own_only_commercial(current_user):
        return
    user_id = str(current_user["_id"])
    owner_id = client.get("commercial_id") or client.get("created_by")
    if owner_id != user_id:
        raise HTTPException(status_code=403, detail="Accès refusé à ce client")


@router.get("/")
async def list_clients(
    search: Optional[str] = None,
    activity_type: Optional[str] = None,
    quartier: Optional[str] = None,
    commercial_id: Optional[str] = None,
    mine_only: Optional[bool] = None,
    current_user=Depends(require_permission("clients", "view")),
    db=Depends(get_database),
):
    query: dict = {}
    and_filters: list[dict] = []
    own_only = _is_own_only_commercial(current_user)
    user_id = str(current_user["_id"])

    if own_only:
        and_filters.append({"$or": [{"commercial_id": user_id}, {"created_by": user_id}]})
    else:
        if mine_only:
            and_filters.append({"$or": [{"commercial_id": user_id}, {"created_by": user_id}]})
        elif commercial_id:
            and_filters.append({"$or": [{"commercial_id": commercial_id}, {"created_by": commercial_id}]})

        if quartier and quartier.strip():
            and_filters.append(
                {"quartier": {"$regex": f"^{re.escape(quartier.strip())}$", "$options": "i"}}
            )

    if activity_type:
        query["activity_type"] = activity_type
    if search and search.strip():
        s = re.escape(search.strip())
        and_filters.append(
            {
                "$or": [
                    {"name": {"$regex": s, "$options": "i"}},
                    {"phone": {"$regex": s, "$options": "i"}},
                    {"address": {"$regex": s, "$options": "i"}},
                    {"quartier": {"$regex": s, "$options": "i"}},
                    {"activity_type": {"$regex": s, "$options": "i"}},
                ]
            }
        )

    if and_filters:
        query["$and"] = and_filters

    clients = await db.clients.find(query).sort("created_at", -1).to_list(length=200)

    commercials = []
    quartiers: list[str] = []
    if not own_only:
        comm_docs = await db.users.find(
            {"role": "commercial", "is_active": True},
            {"full_name": 1, "quartier": 1},
        ).sort("full_name", 1).to_list(length=100)
        commercials = [
            {
                "id": str(c["_id"]),
                "full_name": c.get("full_name", ""),
                "quartier": c.get("quartier", ""),
            }
            for c in comm_docs
        ]
        distinct_q = await db.clients.distinct("quartier")
        quartiers = sorted({q.strip() for q in distinct_q if isinstance(q, str) and q.strip()})

    return {
        "total": len(clients),
        "clients": [serialize_doc(c) for c in clients],
        "commercials": commercials,
        "quartiers": quartiers,
        "visibility_mode": "own_only" if own_only else "all_filtered",
    }


@router.post("/")
async def create_client(
    request: CreateClientRequest,
    current_user=Depends(require_permission("clients", "create")),
    db=Depends(get_database),
):
    now = now_utc()
    user_id = str(current_user["_id"])
    quartier = (request.quartier or "").strip() or (current_user.get("quartier") or "").strip()

    doc = {
        "name": request.name.strip(),
        "activity_type": request.activity_type.strip(),
        "phone": request.phone.strip(),
        "address": request.address.strip(),
        "quartier": quartier,
        "commercial_id": user_id,
        "commercial_name": current_user.get("full_name", ""),
        "needs": [],
        "created_by": user_id,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.clients.insert_one(doc)
    doc["_id"] = result.inserted_id

    await log_action(
        db,
        user_id,
        current_user["full_name"],
        "CREATE",
        "clients",
        f"Création du client commercial: {doc['name']} ({doc['activity_type']}, {quartier or 'sans quartier'})",
        entity_id=str(result.inserted_id),
    )
    await notify_update("clients")
    return serialize_doc(doc)


@router.post("/{client_id}/needs")
async def add_client_need(
    client_id: str,
    request: CreateClientNeedRequest,
    current_user=Depends(require_permission("clients", "update")),
    db=Depends(get_database),
):
    if not ObjectId.is_valid(client_id):
        raise HTTPException(status_code=400, detail="Identifiant client invalide")

    client = await db.clients.find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    _assert_client_access(client, current_user)

    now = now_utc()
    need_item = {
        "id": str(uuid.uuid4()),
        "produit": request.produit.strip(),
        "quantite_kg": request.quantite_kg,
        "status": request.status or "EN_ATTENTE_ACHAT",
        "created_at": now,
        "updated_at": now,
    }

    await db.clients.update_one(
        {"_id": ObjectId(client_id)},
        {"$push": {"needs": need_item}, "$set": {"updated_at": now}},
    )

    await log_action(
        db,
        str(current_user["_id"]),
        current_user["full_name"],
        "ADD_NEED",
        "clients",
        f"Besoin ajouté pour {client['name']}: {need_item['quantite_kg']} kg {need_item['produit']}",
        entity_id=client_id,
    )
    await notify_update("clients")

    updated = await db.clients.find_one({"_id": ObjectId(client_id)})
    return serialize_doc(updated)


@router.patch("/{client_id}/needs/{need_id}")
async def update_client_need(
    client_id: str,
    need_id: str,
    request: UpdateClientNeedRequest,
    current_user=Depends(require_permission("clients", "update")),
    db=Depends(get_database),
):
    if not ObjectId.is_valid(client_id):
        raise HTTPException(status_code=400, detail="Identifiant client invalide")

    client = await db.clients.find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    _assert_client_access(client, current_user)

    needs = client.get("needs", [])
    target = next((n for n in needs if n.get("id") == need_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Besoin introuvable")

    now = now_utc()
    if request.produit is not None:
        target["produit"] = request.produit.strip()
    if request.quantite_kg is not None:
        target["quantite_kg"] = request.quantite_kg
    if request.status is not None:
        target["status"] = request.status
    target["updated_at"] = now

    await db.clients.update_one(
        {"_id": ObjectId(client_id)},
        {"$set": {"needs": needs, "updated_at": now}},
    )

    await log_action(
        db,
        str(current_user["_id"]),
        current_user["full_name"],
        "UPDATE_NEED",
        "clients",
        f"Mise à jour besoin pour {client['name']}: {target['produit']} ({target['quantite_kg']} kg, {target['status']})",
        entity_id=client_id,
    )
    await notify_update("clients")

    updated = await db.clients.find_one({"_id": ObjectId(client_id)})
    return serialize_doc(updated)


@router.delete("/{client_id}/needs/{need_id}")
async def delete_client_need(
    client_id: str,
    need_id: str,
    current_user=Depends(require_permission("clients", "update")),
    db=Depends(get_database),
):
    if not ObjectId.is_valid(client_id):
        raise HTTPException(status_code=400, detail="Identifiant client invalide")

    client = await db.clients.find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(status_code=404, detail="Client introuvable")
    _assert_client_access(client, current_user)

    await db.clients.update_one(
        {"_id": ObjectId(client_id)},
        {"$pull": {"needs": {"id": need_id}}, "$set": {"updated_at": now_utc()}},
    )
    await notify_update("clients")

    updated = await db.clients.find_one({"_id": ObjectId(client_id)})
    return serialize_doc(updated)
