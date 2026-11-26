from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from enum import Enum


class UserRole(str, Enum):
    CLIENT = "client"
    ADMINISTRATOR = "administrator"
    GESTIONNAIRE = "gestionnaire"
    LIVREUR = "livreur"
    COMMERCIAL = "commercial"


class VisibilityMode(str, Enum):
    OWN_ONLY = "own_only"
    ALL_FILTERED = "all_filtered"


class PermissionAction(BaseModel):
    view: bool = False
    create: bool = False
    update: bool = False
    delete: bool = False


class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: UserRole
    is_active: bool = True
    permissions: Optional[Dict[str, Dict[str, bool]]] = {}
    quartier: Optional[str] = None
    visibility_mode: Optional[VisibilityMode] = VisibilityMode.OWN_ONLY


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    permissions: Optional[Dict[str, Dict[str, bool]]] = None
    quartier: Optional[str] = None
    visibility_mode: Optional[VisibilityMode] = None


class UpdatePermissionsRequest(BaseModel):
    permissions: Dict[str, Dict[str, bool]]
