from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.database.connection import get_database
from bson import ObjectId
from typing import Optional

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_database)
):
    token = credentials.credentials
    if await db.revoked_tokens.find_one({"token": token}):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session révoquée. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Compte suspendu")
    
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db=Depends(get_database)
):
    if not credentials:
        return None
    token = credentials.credentials
    if await db.revoked_tokens.find_one({"token": token}):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session révoquée. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user


def require_role(*roles: str):
    async def checker(current_user=Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé"
            )
        return current_user
    return checker


def require_admin():
    return require_role("administrator")


def require_permission(module: str, action: str):
    async def checker(current_user=Depends(get_current_user), db=Depends(get_database)):
        role = current_user.get("role")
        # Admin always has full access
        if role == "administrator":
            return current_user
        # Check permissions
        permissions = current_user.get("permissions", {})
        module_perms = permissions.get(module, {})
        if not module_perms.get(action, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission refusée: {module}.{action}"
            )
        return current_user
    return checker
