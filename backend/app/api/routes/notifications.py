from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from app.database.connection import get_database
from app.core.jwt import get_current_user
from app.utils.helpers import serialize_doc
from typing import List
import json

router = APIRouter()
active_connections: List[WebSocket] = []


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)


async def broadcast(message: dict):
    for connection in active_connections[:]:
        try:
            await connection.send_text(json.dumps(message))
        except Exception:
            if connection in active_connections:
                active_connections.remove(connection)


@router.get("/")
async def get_notifications(
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    notifs = await db.notifications.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).limit(20).to_list(20)
    return [serialize_doc(n) for n in notifs]

