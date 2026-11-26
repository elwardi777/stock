from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_database
from app.core.jwt import get_current_user, require_role
from app.core.security import get_password_hash
from app.schemas.users import CreateUserRequest, UpdateUserRequest, UpdatePermissionsRequest
from app.utils.helpers import serialize_doc, now_utc
from app.utils.audit import log_action
from app.ws import notify_update
from bson import ObjectId
from typing import Optional

router = APIRouter()


def user_safe(user):
    u = serialize_doc(user)
    u.pop("password_hash", None)
    return u


@router.get("/")
async def list_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user=Depends(require_role("administrator", "gestionnaire")),
    db=Depends(get_database)
):
    query = {}
    if role:
        query["role"] = role
    if is_active is not None:
        query["is_active"] = is_active
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    
    skip = (page - 1) * limit
    total = await db.users.count_documents(query)
    users = await db.users.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(length=limit)
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "users": [user_safe(u) for u in users]
    }


@router.post("/")
async def create_user(
    request: CreateUserRequest,
    current_user=Depends(require_role("administrator")),
    db=Depends(get_database)
):
    existing = await db.users.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    user_doc = {
        "full_name": request.full_name,
        "email": request.email.lower(),
        "phone": request.phone,
        "password_hash": get_password_hash(request.password),
        "role": request.role.value,
        "permissions": request.permissions or {},
        "is_active": request.is_active,
        "quartier": (request.quartier or "").strip(),
        "visibility_mode": (
            request.visibility_mode.value if request.visibility_mode else "own_only"
        ),
        "created_by": str(current_user["_id"]),
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "CREATE", "users", f"Création du compte {request.email}", 
                     entity_id=str(result.inserted_id))

    await notify_update("users")
    if request.role == "livreur":
        await notify_update("livraisons")
    if request.role == "commercial":
        await notify_update("clients")

    return user_safe(user_doc)


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    current_user=Depends(require_role("administrator", "gestionnaire")),
    db=Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user_safe(user)


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    request: UpdateUserRequest,
    current_user=Depends(require_role("administrator")),
    db=Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    update_data = request.model_dump(mode="json", exclude_none=True)
    if "quartier" in update_data and isinstance(update_data["quartier"], str):
        update_data["quartier"] = update_data["quartier"].strip()
    update_data["updated_at"] = now_utc()
    
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "UPDATE", "users", f"Modification du compte {user['email']}", 
                     entity_id=user_id)

    await notify_update("users")
    if user.get("role") == "livreur" or request.role == "livreur":
        await notify_update("livraisons")
    if user.get("role") == "commercial" or request.role == "commercial":
        await notify_update("clients")

    updated = await db.users.find_one({"_id": ObjectId(user_id)})
    return user_safe(updated)


@router.put("/{user_id}/permissions")
async def update_permissions(
    user_id: str,
    request: UpdatePermissionsRequest,
    current_user=Depends(require_role("administrator")),
    db=Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user["role"] == "administrator":
        raise HTTPException(status_code=400, detail="Impossible de modifier les permissions d'un administrateur")
    
    old_perms = user.get("permissions", {})
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"permissions": request.permissions, "updated_at": now_utc()}}
    )
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "UPDATE_PERMISSIONS", "users", f"Modification permissions de {user['email']}",
                     old_value=old_perms, new_value=request.permissions, entity_id=user_id)

    await notify_update("users")

    return {"message": "Permissions mises à jour"}


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user=Depends(require_role("administrator")),
    db=Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if str(user["_id"]) == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    
    await db.users.delete_one({"_id": ObjectId(user_id)})
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "DELETE", "users", f"Suppression du compte {user['email']}", entity_id=user_id)
    await notify_update("users")
    if user.get("role") == "livreur":
        await notify_update("livraisons")
    return {"message": "Utilisateur supprimé"}


@router.patch("/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    current_user=Depends(require_role("administrator")),
    db=Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    new_status = not user.get("is_active", True)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": new_status, "updated_at": now_utc()}})
    action = "ACTIVATE" if new_status else "SUSPEND"
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     action, "users", f"Statut compte {user['email']} -> {'actif' if new_status else 'suspendu'}", entity_id=user_id)
    await notify_update("users")
    if user.get("role") == "livreur":
        await notify_update("livraisons")
    return {"message": f"Compte {'activé' if new_status else 'suspendu'}", "is_active": new_status}
