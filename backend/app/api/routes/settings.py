from fastapi import APIRouter, Depends
from app.database.connection import get_database
from app.core.jwt import require_permission
from app.utils.helpers import serialize_doc, now_utc

router = APIRouter()


@router.get("/")
async def get_settings(db=Depends(get_database)):
    settings = await db.settings.find_one({"key": "app_settings"})
    return serialize_doc(settings) if settings else {}


@router.put("/")
async def update_settings(
    data: dict,
    current_user=Depends(require_permission("settings", "update")),
    db=Depends(get_database)
):
    data.pop("_id", None)
    data.pop("key", None)
    data["updated_at"] = now_utc()
    await db.settings.update_one(
        {"key": "app_settings"},
        {"$set": data},
        upsert=True
    )
    updated = await db.settings.find_one({"key": "app_settings"})
    return serialize_doc(updated)

