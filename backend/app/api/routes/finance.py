from fastapi import APIRouter, Depends
from app.database.connection import get_database
from app.core.jwt import require_permission
from datetime import datetime, timezone, timedelta

router = APIRouter()


@router.get("/summary")
async def get_finance_summary(
    period: str = "month",
    current_user=Depends(require_permission("finance", "view")),
    db=Depends(get_database)
):
    now = datetime.now(timezone.utc)
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start = now - timedelta(days=7)
    elif period == "month":
        start = now - timedelta(days=30)
    elif period == "year":
        start = now - timedelta(days=365)
    else:
        start = now - timedelta(days=30)
    
    pipeline = [
        {"$match": {"status": "livree", "created_at": {"$gte": start}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$total"}, "count": {"$sum": 1}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    revenue = revenue_result[0]["revenue"] if revenue_result else 0
    order_count = revenue_result[0]["count"] if revenue_result else 0
    
    cost_pipeline = [
        {"$match": {"type": "in", "created_at": {"$gte": start}, "unit_cost": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "total_cost": {"$sum": {"$multiply": ["$quantity_change", "$unit_cost"]}}}}
    ]
    cost_result = await db.stock_movements.aggregate(cost_pipeline).to_list(1)
    total_cost = cost_result[0]["total_cost"] if cost_result else 0
    
    gross_profit = revenue - total_cost
    
    return {
        "period": period,
        "revenue": revenue,
        "total_cost": total_cost,
        "gross_profit": gross_profit,
        "order_count": order_count,
        "avg_order_value": revenue / order_count if order_count > 0 else 0,
    }


@router.get("/revenue-chart")
async def get_revenue_chart(
    days: int = 30,
    current_user=Depends(require_permission("finance", "view")),
    db=Depends(get_database)
):
    start = datetime.now(timezone.utc) - timedelta(days=days)
    pipeline = [
        {"$match": {"status": "livree", "created_at": {"$gte": start}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "revenue": {"$sum": "$total"},
            "orders": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    result = await db.orders.aggregate(pipeline).to_list(100)
    return [{"date": r["_id"], "revenue": r["revenue"], "orders": r["orders"]} for r in result]


@router.get("/top-products")
async def get_top_products(
    limit: int = 10,
    current_user=Depends(require_permission("finance", "view")),
    db=Depends(get_database)
):
    pipeline = [
        {"$match": {"status": "livree"}},
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.product_name",
            "total_qty": {"$sum": "$items.quantity"},
            "total_revenue": {"$sum": "$items.line_total"},
        }},
        {"$sort": {"total_revenue": -1}},
        {"$limit": limit}
    ]
    result = await db.orders.aggregate(pipeline).to_list(limit)
    return result

