from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_database
from app.core.jwt import get_current_user, require_permission
from app.schemas.orders import CreateOrderRequest, UpdateOrderStatusRequest, AssignDeliveryRequest
from app.utils.helpers import serialize_doc, now_utc, generate_order_number
from app.utils.audit import log_action
from bson import ObjectId
from typing import Optional

router = APIRouter()


@router.post("/")
async def create_order(
    request: CreateOrderRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    items = []
    total = 0
    
    for item in request.items:
        product = await db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Produit introuvable: {item.product_id}")
        if not product.get("is_active") or not product.get("is_visible"):
            raise HTTPException(status_code=400, detail=f"Produit non disponible: {product['name_fr']}")
        if product.get("quantity", 0) < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuffisant pour {product['name_fr']}")
        
        line_total = product["selling_price"] * item.quantity
        total += line_total
        items.append({
            "product_id": item.product_id,
            "product_name": product["name_fr"],
            "unit": product.get("unit", "kg"),
            "quantity": item.quantity,
            "unit_price": product["selling_price"],
            "line_total": line_total,
            "image_url": product.get("image_url"),
        })
    
    app_settings = await db.settings.find_one({"key": "app_settings"})
    delivery_fee = 0
    if app_settings:
        threshold = app_settings.get("free_delivery_threshold", 200)
        fee = app_settings.get("delivery_fee", 15)
        delivery_fee = 0 if total >= threshold else fee
    
    grand_total = total + delivery_fee
    
    order_doc = {
        "order_number": generate_order_number(),
        "customer_id": str(current_user["_id"]),
        "customer_name": current_user["full_name"],
        "customer_phone": request.delivery_phone,
        "items": items,
        "subtotal": total,
        "delivery_fee": delivery_fee,
        "total": grand_total,
        "delivery_address": request.delivery_address,
        "delivery_city": request.delivery_city,
        "delivery_time_slot": request.delivery_time_slot,
        "payment_method": request.payment_method,
        "notes": request.notes,
        "status": "en_attente",
        "livreur_id": None,
        "livreur_name": None,
        "status_history": [{"status": "en_attente", "timestamp": now_utc().isoformat(), "note": "Commande créée"}],
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    
    for item in request.items:
        await db.products.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"quantity": -item.quantity}, "$set": {"updated_at": now_utc()}}
        )
    
    result = await db.orders.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id
    
    return serialize_doc(order_doc)


@router.get("/")
async def list_orders(
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    role = current_user.get("role")
    query = {}
    
    if role == "client":
        query["customer_id"] = str(current_user["_id"])
    elif role == "livreur":
        query["livreur_id"] = str(current_user["_id"])
    
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"order_number": {"$regex": search, "$options": "i"}},
            {"customer_name": {"$regex": search, "$options": "i"}},
        ]
    
    skip = (page - 1) * limit
    total = await db.orders.count_documents(query)
    orders = await db.orders.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(length=limit)
    
    return {"total": total, "page": page, "limit": limit, "orders": [serialize_doc(o) for o in orders]}


@router.get("/{order_id}")
async def get_order(order_id: str, current_user=Depends(get_current_user), db=Depends(get_database)):
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    role = current_user.get("role")
    if role == "client" and order.get("customer_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Accès refusé")
    if role == "livreur" and order.get("livreur_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Accès refusé")
    return serialize_doc(order)


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    request: UpdateOrderStatusRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    
    role = current_user.get("role")
    if role == "livreur" and order.get("livreur_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    old_status = order["status"]
    status_history = order.get("status_history", [])
    status_history.append({
        "status": request.status,
        "timestamp": now_utc().isoformat(),
        "note": request.notes,
        "updated_by": str(current_user["_id"]),
    })
    
    update_data = {
        "status": request.status,
        "status_history": status_history,
        "updated_at": now_utc(),
    }
    
    if request.status == "annulee" and old_status not in ["annulee", "non_livree"]:
        for item in order.get("items", []):
            await db.products.update_one(
                {"_id": ObjectId(item["product_id"])},
                {"$inc": {"quantity": item["quantity"]}}
            )
    
    await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": update_data})
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "STATUS_UPDATE", "orders", f"Statut commande {order['order_number']}: {old_status} -> {request.status}",
                     entity_id=order_id)
    
    return {"message": "Statut mis à jour"}


@router.patch("/{order_id}/assign-livreur")
async def assign_livreur(
    order_id: str,
    request: AssignDeliveryRequest,
    current_user=Depends(require_permission("orders", "update")),
    db=Depends(get_database)
):
    livreur = await db.users.find_one({"_id": ObjectId(request.livreur_id), "role": "livreur"})
    if not livreur:
        raise HTTPException(status_code=404, detail="Livreur introuvable")
    
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"livreur_id": request.livreur_id, "livreur_name": livreur["full_name"], "updated_at": now_utc()}}
    )
    return {"message": f"Commande assignée à {livreur['full_name']}"}

