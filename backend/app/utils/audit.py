from datetime import datetime, timezone
from typing import Optional, Any


async def log_action(
    db,
    user_id: str,
    user_name: str,
    action: str,
    module: str,
    description: str = "",
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None,
    entity_id: Optional[str] = None,
):
    """Record an audit log entry."""
    await db.audit_logs.insert_one({
        "user_id": user_id,
        "user_name": user_name,
        "action": action,
        "module": module,
        "description": description,
        "old_value": old_value,
        "new_value": new_value,
        "entity_id": entity_id,
        "created_at": datetime.now(timezone.utc),
    })
