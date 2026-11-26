from pydantic import BaseModel, Field
from typing import Optional


class CreateClientRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    activity_type: str = Field(..., min_length=1, max_length=80)
    phone: str = ""
    address: str = ""
    quartier: Optional[str] = ""


class CreateClientNeedRequest(BaseModel):
    produit: str = Field(..., min_length=1, max_length=150)
    quantite_kg: float = Field(..., gt=0)
    status: str = "EN_ATTENTE_ACHAT"


class UpdateClientNeedRequest(BaseModel):
    produit: Optional[str] = Field(default=None, min_length=1, max_length=150)
    quantite_kg: Optional[float] = Field(default=None, gt=0)
    status: Optional[str] = None
