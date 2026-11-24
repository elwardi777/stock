from pydantic import BaseModel, field_validator
from typing import Optional, List
from enum import Enum


class ProductUnit(str, Enum):
    KG = "kg"
    PIECE = "piece"
    BUNCH = "botte"
    PACK = "pack"
    BASKET = "panier"
    BOX = "caisse"


class CreateProductRequest(BaseModel):
    name_fr: str
    name_ar: Optional[str] = ""
    description: Optional[str] = ""
    category_id: str
    purchase_price: float
    selling_price: float
    unit: ProductUnit = ProductUnit.KG
    quantity: float = 0
    stock_threshold: float = 5
    is_active: bool = True
    is_visible: bool = True

    @field_validator("selling_price")
    @classmethod
    def selling_price_positive(cls, v):
        if v < 0:
            raise ValueError("Le prix de vente doit être positif")
        return v

    @field_validator("purchase_price")
    @classmethod
    def purchase_price_positive(cls, v):
        if v < 0:
            raise ValueError("Le prix d'achat doit être positif")
        return v


class UpdateProductRequest(BaseModel):
    name_fr: Optional[str] = None
    name_ar: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    unit: Optional[ProductUnit] = None
    stock_threshold: Optional[float] = None
    is_active: Optional[bool] = None
    is_visible: Optional[bool] = None


class CreateCategoryRequest(BaseModel):
    name: str
    name_ar: Optional[str] = ""
    slug: str
    icon: Optional[str] = "🌿"
    order: int = 0
    is_active: bool = True
