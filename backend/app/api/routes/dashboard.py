from fastapi import APIRouter, Depends
from app.database.connection import get_database
from app.core.jwt import require_permission
from datetime import datetime, timezone, timedelta

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user=Depends(require_permission("dashboard", "view")),
    db=Depends(get_database)
):
    now = datetime.now(timezone.utc)
    month_start = now - timedelta(days=30)
    
    rev_pipeline = [
        {"$match": {"status": "livree", "created_at": {"$gte": month_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    rev_result = await db.orders.aggregate(rev_pipeline).to_list(1)
    monthly_revenue = rev_result[0]["total"] if rev_result else 0
    
    total_orders = await db.orders.count_documents({"created_at": {"$gte": month_start}})
    active_clients = await db.users.count_documents({"role": "client", "is_active": True})
    active_products = await db.products.count_documents({"is_active": True})
    low_stock = await db.products.count_documents({
        "is_active": True,
        "$expr": {"$and": [{"$gt": ["$quantity", 0]}, {"$lte": ["$quantity", "$stock_threshold"]}]}
    })
    out_of_stock = await db.products.count_documents({"is_active": True, "quantity": {"$lte": 0}})
    pending_orders = await db.orders.count_documents({"status": "en_attente"})
    
    return {
        "monthly_revenue": monthly_revenue,
        "total_orders": total_orders,
        "active_clients": active_clients,
        "active_products": active_products,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock,
        "pending_orders": pending_orders,
    }

