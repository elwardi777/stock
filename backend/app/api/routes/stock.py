from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_database
from app.core.jwt import require_permission
from app.utils.helpers import serialize_doc, now_utc
from app.utils.audit import log_action
from bson import ObjectId
from typing import Optional

router = APIRouter()


@router.get("/")
async def get_stock_overview(
    current_user=Depends(require_permission("stock", "view")),
    db=Depends(get_database)
):
    total = await db.products.count_documents({"is_active": True})
    low_stock = await db.products.count_documents({
        "is_active": True,
        "$expr": {"$and": [{"$gt": ["$quantity", 0]}, {"$lte": ["$quantity", "$stock_threshold"]}]}
    })
    out_of_stock = await db.products.count_documents({"is_active": True, "quantity": {"$lte": 0}})
    pending_orders = await db.orders.count_documents({"status": "en_attente"})
    
    return {
        "total_active": total,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "pending_orders": pending_orders,
    }


@router.post("/adjust")
async def adjust_stock(
    data: dict,
    current_user=Depends(require_permission("stock", "update")),
    db=Depends(get_database)
):
    product_id = data.get("product_id")
    quantity = float(data.get("quantity", 0))
    movement_type = data.get("type", "adjustment")
    reason = data.get("reason", "")
    unit_cost = data.get("unit_cost")
    
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    
    old_qty = product.get("quantity", 0)
    if movement_type == "in":
        new_qty = old_qty + quantity
    elif movement_type == "out":
        new_qty = max(0, old_qty - quantity)
    else:
        new_qty = quantity
    
    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"quantity": new_qty, "updated_at": now_utc()}}
    )
    
    movement = {
        "product_id": product_id,
        "product_name": product["name_fr"],
        "type": movement_type,
        "quantity_change": quantity if movement_type != "adjustment" else new_qty - old_qty,
        "quantity_before": old_qty,
        "quantity_after": new_qty,
        "reason": reason,
        "unit_cost": unit_cost,
        "performed_by": str(current_user["_id"]),
        "performer_name": current_user["full_name"],
        "created_at": now_utc(),
    }
    await db.stock_movements.insert_one(movement)
    
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "STOCK_ADJUST", "stock", f"Ajustement stock {product['name_fr']}: {old_qty} -> {new_qty}",
                     old_value=old_qty, new_value=new_qty, entity_id=product_id)
    
    return {"message": "Stock ajusté", "old_quantity": old_qty, "new_quantity": new_qty}


@router.get("/movements")
async def get_stock_movements(
    product_id: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user=Depends(require_permission("stock", "view")),
    db=Depends(get_database)
):
    query = {}
    if product_id:
        query["product_id"] = product_id
    skip = (page - 1) * limit
    total = await db.stock_movements.count_documents(query)
    movements = await db.stock_movements.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(length=limit)
    return {"total": total, "movements": [serialize_doc(m) for m in movements]}

