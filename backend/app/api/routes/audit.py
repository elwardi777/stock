from fastapi import APIRouter, Depends
from app.database.connection import get_database
from app.core.jwt import require_permission
from app.utils.helpers import serialize_doc
from typing import Optional

router = APIRouter()


@router.get("/")
async def get_audit_logs(
    module: Optional[str] = None,
    action: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user=Depends(require_permission("audit", "view")),
    db=Depends(get_database)
):
    query = {}
    if module:
        query["module"] = module
    if action:
        query["action"] = action
    
    skip = (page - 1) * limit
    total = await db.audit_logs.count_documents(query)
    logs = await db.audit_logs.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(length=limit)
    
    return {"total": total, "page": page, "limit": limit, "logs": [serialize_doc(l) for l in logs]}

