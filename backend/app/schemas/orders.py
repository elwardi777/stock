from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "en_attente"
    CONFIRMED = "confirmee"
    PREPARING = "en_preparation"
    READY = "prete_livraison"
    DELIVERING = "en_livraison"
    DELIVERED = "livree"
    CANCELLED = "annulee"
    FAILED = "non_livree"


class OrderItemRequest(BaseModel):
    product_id: str
    quantity: float


class CreateOrderRequest(BaseModel):
    items: List[OrderItemRequest]
    delivery_address: str
    delivery_city: str
    delivery_phone: str
    delivery_time_slot: str
    notes: Optional[str] = ""
    payment_method: str = "cash_on_delivery"


class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus
    notes: Optional[str] = ""


class AssignDeliveryRequest(BaseModel):
    livreur_id: str


class StockAdjustmentRequest(BaseModel):
    product_id: str
    quantity: float
    type: str  # "in", "out", "adjustment"
    reason: str
    unit_cost: Optional[float] = None
