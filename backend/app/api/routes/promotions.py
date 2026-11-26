from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_database
from app.core.jwt import require_permission
from app.utils.helpers import serialize_doc, now_utc
from bson import ObjectId
from app.ws import notify_update
from datetime import datetime, timezone
from typing import Optional

router = APIRouter()


@router.get("/")
async def list_promotions(
    is_active: Optional[bool] = None,
    db=Depends(get_database)
):
    query = {}
    if is_active is not None:
        query["is_active"] = is_active
    promos = await db.promotions.find(query).sort("created_at", -1).to_list(length=100)
    return [serialize_doc(p) for p in promos]


@router.get("/active-public")
async def get_active_promotions(db=Depends(get_database)):
    now = datetime.now(timezone.utc)
    promos = await db.promotions.find({
        "is_active": True,
        "$or": [{"end_date": None}, {"end_date": {"$gte": now}}],
    }).to_list(length=20)
    return [serialize_doc(p) for p in promos]


@router.post("/")
async def create_promotion(
    data: dict,
    current_user=Depends(require_permission("promotions", "create")),
    db=Depends(get_database)
):
    data["created_at"] = now_utc()
    data["created_by"] = str(current_user["_id"])
    result = await db.promotions.insert_one(data)
    data["_id"] = result.inserted_id
    await notify_update("products")
    return serialize_doc(data)


@router.put("/{promo_id}")
async def update_promotion(
    promo_id: str,
    data: dict,
    current_user=Depends(require_permission("promotions", "update")),
    db=Depends(get_database)
):
    data["updated_at"] = now_utc()
    result = await db.promotions.update_one({"_id": ObjectId(promo_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Promotion introuvable")
    updated = await db.promotions.find_one({"_id": ObjectId(promo_id)})
    await notify_update("products")
    return serialize_doc(updated)


@router.delete("/{promo_id}")
async def delete_promotion(
    promo_id: str,
    current_user=Depends(require_permission("promotions", "delete")),
    db=Depends(get_database)
):
    result = await db.promotions.delete_one({"_id": ObjectId(promo_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion introuvable")
    await notify_update("products")
    return {"message": "Promotion supprimée"}

