from fastapi import APIRouter, Depends, HTTPException, status, Header, Body
from app.database.connection import get_database
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshRequest, ChangePasswordRequest
from app.core.jwt import get_current_user
from app.utils.helpers import serialize_doc, now_utc
from bson import ObjectId
from typing import Optional

router = APIRouter()


def user_response(user: dict) -> dict:
    u = serialize_doc(user)
    u.pop("password_hash", None)
    if "permissions" not in u or u["permissions"] is None:
        u["permissions"] = {}
    return u


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db=Depends(get_database)):
    user = await db.users.find_one({"email": request.email.lower()})
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Compte suspendu. Contactez l'administrateur.")
    
    user_id = str(user["_id"])
    access_token = create_access_token({"sub": user_id, "role": user["role"]})
    refresh_token = create_refresh_token({"sub": user_id})
    
    # Update last login
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": now_utc()}})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response(user)
    )


@router.post("/register")
async def register(request: RegisterRequest, db=Depends(get_database)):
    existing = await db.users.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    user_doc = {
        "full_name": request.full_name,
        "email": request.email.lower(),
        "phone": request.phone,
        "password_hash": get_password_hash(request.password),
        "role": "client",
        "permissions": {},
        "is_active": True,
        "addresses": [],
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    return {"message": "Compte créé avec succès", "user": user_response(user_doc)}


@router.post("/refresh")
async def refresh_token(request: RefreshRequest, db=Depends(get_database)):
    if await db.revoked_tokens.find_one({"token": request.refresh_token}):
        raise HTTPException(status_code=401, detail="Refresh token révoqué")
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token invalide")
    
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Utilisateur introuvable ou inactif")
    
    access_token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(
    payload: Optional[dict] = Body(default=None),
    authorization: Optional[str] = Header(default=None),
    db=Depends(get_database),
):
    """Revoke access and refresh tokens on logout."""
    tokens_to_revoke = []
    if authorization and authorization.lower().startswith("bearer "):
        tokens_to_revoke.append(authorization.split(" ", 1)[1].strip())
    if payload and payload.get("refresh_token"):
        tokens_to_revoke.append(payload["refresh_token"])

    now = now_utc()
    for token in tokens_to_revoke:
        if token:
            await db.revoked_tokens.update_one(
                {"token": token},
                {"$set": {"token": token, "revoked_at": now}},
                upsert=True,
            )

    return {"message": "Déconnexion réussie"}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return user_response(current_user)


@router.put("/me")
async def update_me(data: dict, current_user=Depends(get_current_user), db=Depends(get_database)):
    allowed_fields = {"full_name", "phone"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updated_at"] = now_utc()
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return user_response(updated)


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    if not verify_password(request.old_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    new_hash = get_password_hash(request.new_password)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_hash": new_hash, "updated_at": now_utc()}}
    )
    return {"message": "Mot de passe modifié avec succès"}
