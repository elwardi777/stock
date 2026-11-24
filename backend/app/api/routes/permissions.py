from fastapi import APIRouter, Depends
from app.core.jwt import get_current_user, require_role

router = APIRouter()

AVAILABLE_MODULES = {
    "dashboard": {"label": "Tableau de bord", "actions": ["view"]},
    "users": {"label": "Utilisateurs", "actions": ["view", "create", "update", "delete"]},
    "products": {"label": "Produits", "actions": ["view", "create", "update", "delete"]},
    "categories": {"label": "Catégories", "actions": ["view", "create", "update", "delete"]},
    "stock": {"label": "Stock", "actions": ["view", "create", "update", "delete"]},
    "orders": {"label": "Commandes", "actions": ["view", "create", "update", "delete"]},
    "deliveries": {"label": "Livraisons", "actions": ["view", "update"]},
    "promotions": {"label": "Promotions", "actions": ["view", "create", "update", "delete"]},
    "finance": {"label": "Finances", "actions": ["view"]},
    "reports": {"label": "Rapports", "actions": ["view"]},
    "audit": {"label": "Journal d'activité", "actions": ["view"]},
    "settings": {"label": "Paramètres", "actions": ["view", "update"]},
}


@router.get("/modules")
async def get_modules(current_user=Depends(require_role("administrator"))):
    return AVAILABLE_MODULES


@router.get("/my-permissions")
async def get_my_permissions(current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role == "administrator":
        # Admin has all permissions
        return {module: {action: True for action in data["actions"]} 
                for module, data in AVAILABLE_MODULES.items()}
    return current_user.get("permissions", {})
