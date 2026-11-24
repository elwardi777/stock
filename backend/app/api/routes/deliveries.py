from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_database
from app.core.jwt import get_current_user, require_permission
from app.utils.helpers import serialize_doc
from typing import Optional

router = APIRouter()


@router.get("/my-deliveries")
async def get_my_deliveries(
    status: Optional[str] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    if current_user.get("role") != "livreur":
        raise HTTPException(status_code=403, detail="Accès réservé aux livreurs")
    
    query = {"livreur_id": str(current_user["_id"])}
    if status:
        query["status"] = status
    orders = await db.orders.find(query).sort("created_at", -1).to_list(length=100)
    return [serialize_doc(o) for o in orders]


@router.get("/livreurs")
async def list_livreurs(
    current_user=Depends(require_permission("deliveries", "view")),
    db=Depends(get_database)
):
    livreurs = await db.users.find({"role": "livreur", "is_active": True}).to_list(length=100)
    result = []
    for l in livreurs:
        l_dict = serialize_doc(l)
        l_dict.pop("password_hash", None)
        active_count = await db.orders.count_documents({
            "livreur_id": str(l["_id"]),
            "status": {"$in": ["en_livraison", "prete_livraison"]}
        })
        l_dict["active_deliveries"] = active_count
        result.append(l_dict)
    return result

