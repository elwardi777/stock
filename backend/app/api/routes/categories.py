from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_database
from app.core.jwt import get_current_user, require_role, require_permission
from app.schemas.products import CreateCategoryRequest
from app.utils.helpers import serialize_doc, now_utc
from bson import ObjectId

router = APIRouter()


@router.get("/")
async def list_categories(db=Depends(get_database)):
    cats = await db.categories.find({"is_active": True}).sort("order", 1).to_list(length=100)
    return [serialize_doc(c) for c in cats]


@router.get("/all")
async def list_all_categories(
    current_user=Depends(require_permission("categories", "view")),
    db=Depends(get_database)
):
    cats = await db.categories.find().sort("order", 1).to_list(length=100)
    return [serialize_doc(c) for c in cats]


@router.post("/")
async def create_category(
    request: CreateCategoryRequest,
    current_user=Depends(require_permission("categories", "create")),
    db=Depends(get_database)
):
    existing = await db.categories.find_one({"slug": request.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Ce slug existe déjà")
    doc = request.model_dump()
    doc["created_at"] = now_utc()
    result = await db.categories.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{cat_id}")
async def update_category(
    cat_id: str,
    request: CreateCategoryRequest,
    current_user=Depends(require_permission("categories", "update")),
    db=Depends(get_database)
):
    update_data = request.model_dump()
    update_data["updated_at"] = now_utc()
    result = await db.categories.update_one({"_id": ObjectId(cat_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    updated = await db.categories.find_one({"_id": ObjectId(cat_id)})
    return serialize_doc(updated)


@router.delete("/{cat_id}")
async def delete_category(
    cat_id: str,
    current_user=Depends(require_permission("categories", "delete")),
    db=Depends(get_database)
):
    result = await db.categories.delete_one({"_id": ObjectId(cat_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Catégorie introuvable")
    return {"message": "Catégorie supprimée"}
