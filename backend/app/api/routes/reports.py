from fastapi import APIRouter, Depends
from app.database.connection import get_database
from app.core.jwt import require_permission

router = APIRouter()


@router.get("/orders-by-status")
async def orders_by_status(
    current_user=Depends(require_permission("reports", "view")),
    db=Depends(get_database)
):
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    result = await db.orders.aggregate(pipeline).to_list(20)
    return [{"status": r["_id"], "count": r["count"]} for r in result]

