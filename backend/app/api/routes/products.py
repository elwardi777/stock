from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.database.connection import get_database
from app.core.jwt import get_current_user, require_permission
from app.utils.helpers import serialize_doc, now_utc
from app.utils.audit import log_action
from app.core.config import settings
from app.ws import notify_update
from bson import ObjectId
from typing import Optional
import os, uuid, aiofiles

router = APIRouter()


def get_stock_status(quantity: float, threshold: float) -> str:
    if quantity <= 0:
        return "rupture"
    elif quantity <= threshold:
        return "faible"
    return "en_stock"


@router.get("/")
async def list_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    is_visible: Optional[bool] = None,
    page: int = 1,
    limit: int = 20,
    db=Depends(get_database)
):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["$or"] = [
            {"name_fr": {"$regex": search, "$options": "i"}},
            {"name_ar": {"$regex": search, "$options": "i"}},
        ]
    if is_visible is not None:
        query["is_visible"] = is_visible
    if status == "en_stock":
        query["quantity"] = {"$gt": 0}
    elif status == "rupture":
        query["quantity"] = {"$lte": 0}
    elif status == "faible":
        query["$expr"] = {"$and": [{"$gt": ["$quantity", 0]}, {"$lte": ["$quantity", "$stock_threshold"]}]}
    
    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(length=limit)
    
    result = []
    for p in products:
        p_dict = serialize_doc(p)
        p_dict["stock_status"] = get_stock_status(p.get("quantity", 0), p.get("stock_threshold", 5))
        if p.get("category_id"):
            try:
                cat = await db.categories.find_one({"_id": ObjectId(p["category_id"])})
                p_dict["category_name"] = cat["name"] if cat else ""
            except Exception:
                p_dict["category_name"] = ""
        result.append(p_dict)
    
    return {"total": total, "page": page, "limit": limit, "products": result}


@router.get("/public")
async def list_public_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db=Depends(get_database)
):
    query = {"is_visible": True, "is_active": True, "quantity": {"$gt": 0}}
    if category_id:
        # Support filtering by slug or id
        cat = await db.categories.find_one({"slug": category_id})
        if cat:
            query["category_id"] = str(cat["_id"])
        else:
            query["category_id"] = category_id
    if search:
        query["$or"] = [
            {"name_fr": {"$regex": search, "$options": "i"}},
            {"name_ar": {"$regex": search, "$options": "i"}},
        ]
    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query).skip(skip).limit(limit).to_list(length=limit)
    result = []
    for p in products:
        p_dict = serialize_doc(p)
        p_dict.pop("purchase_price", None)
        p_dict["stock_status"] = get_stock_status(p.get("quantity", 0), p.get("stock_threshold", 5))
        result.append(p_dict)
    return {"total": total, "page": page, "limit": limit, "products": result}


@router.get("/{product_id}")
async def get_product(product_id: str, db=Depends(get_database)):
    product = None
    if ObjectId.is_valid(product_id):
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        product = await db.products.find_one({"slug": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    p_dict = serialize_doc(product)
    p_dict["stock_status"] = get_stock_status(product.get("quantity", 0), product.get("stock_threshold", 5))
    if product.get("category_id"):
        try:
            cat = await db.categories.find_one({"_id": ObjectId(product["category_id"])})
            if cat:
                p_dict["category_name"] = cat.get("name", "")
                p_dict["category_slug"] = cat.get("slug", "")
        except Exception:
            pass
    return p_dict


@router.post("/")
async def create_product(
    name_fr: str = Form(...),
    name_ar: str = Form(""),
    description: str = Form(""),
    category_id: str = Form(...),
    purchase_price: float = Form(...),
    selling_price: float = Form(...),
    unit: str = Form("kg"),
    quantity: float = Form(0),
    stock_threshold: float = Form(5),
    is_active: bool = Form(True),
    is_visible: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    current_user=Depends(require_permission("products", "create")),
    db=Depends(get_database)
):
    image_url = None
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            content = await image.read()
            await f.write(content)
        image_url = f"/uploads/{filename}"
    
    doc = {
        "name_fr": name_fr,
        "name_ar": name_ar,
        "description": description,
        "category_id": category_id,
        "purchase_price": purchase_price,
        "selling_price": selling_price,
        "unit": unit,
        "quantity": quantity,
        "stock_threshold": stock_threshold,
        "is_active": is_active,
        "is_visible": is_visible,
        "image_url": image_url,
        "created_by": str(current_user["_id"]),
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "CREATE", "products", f"Création du produit: {name_fr}", entity_id=str(result.inserted_id))

    await notify_update("products")
    await notify_update("stock")

    return serialize_doc(doc)


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    name_fr: Optional[str] = Form(None),
    name_ar: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    purchase_price: Optional[float] = Form(None),
    selling_price: Optional[float] = Form(None),
    unit: Optional[str] = Form(None),
    quantity: Optional[float] = Form(None),
    stock_threshold: Optional[float] = Form(None),
    is_active: Optional[bool] = Form(None),
    is_visible: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user=Depends(require_permission("products", "update")),
    db=Depends(get_database)
):
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    
    update_data = {}
    for field in ["name_fr", "name_ar", "description", "category_id", "purchase_price", "selling_price", "unit", "quantity", "stock_threshold", "is_active", "is_visible"]:
        val = locals().get(field)
        if val is not None:
            update_data[field] = val
    
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            content = await image.read()
            await f.write(content)
        update_data["image_url"] = f"/uploads/{filename}"
    
    if "selling_price" in update_data or "purchase_price" in update_data:
        price_history = product.get("price_history", [])
        price_history.append({
            "purchase_price": product.get("purchase_price"),
            "selling_price": product.get("selling_price"),
            "changed_at": now_utc().isoformat(),
            "changed_by": str(current_user["_id"]),
        })
        update_data["price_history"] = price_history[-10:]
    
    update_data["updated_at"] = now_utc()
    await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": update_data})
    
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "UPDATE", "products", f"Modification: {product['name_fr']}", entity_id=product_id)

    await notify_update("products")
    await notify_update("stock")

    updated = await db.products.find_one({"_id": ObjectId(product_id)})
    return serialize_doc(updated)


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user=Depends(require_permission("products", "delete")),
    db=Depends(get_database)
):
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    await db.products.delete_one({"_id": ObjectId(product_id)})
    await log_action(db, str(current_user["_id"]), current_user["full_name"],
                     "DELETE", "products", f"Suppression: {product['name_fr']}", entity_id=product_id)
    await notify_update("products")
    await notify_update("stock")
    return {"message": "Produit supprimé"}


@router.patch("/{product_id}/toggle-visibility")
async def toggle_visibility(
    product_id: str,
    current_user=Depends(require_permission("products", "update")),
    db=Depends(get_database)
):
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    new_visibility = not product.get("is_visible", True)
    await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": {"is_visible": new_visibility, "updated_at": now_utc()}})
    await notify_update("products")
    await notify_update("stock")
    return {"is_visible": new_visibility}

