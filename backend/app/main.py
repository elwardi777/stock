from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.database.connection import connect_db, close_db
from app.api.routes import (
    auth, users, permissions, products, categories,
    stock, orders, deliveries, promotions, finance,
    reports, notifications, settings as settings_router,
    audit, dashboard, clients
)
from app.middleware.logging import LoggingMiddleware
from app.ws import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    await close_db()


app = FastAPI(
    title="DFL Fresh API",
    description="API pour la plateforme DFL Fresh - Fruits & Légumes Frais",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)

# Static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(permissions.router, prefix="/api/permissions", tags=["Permissions"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(stock.router, prefix="/api/stock", tags=["Stock"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(deliveries.router, prefix="/api/deliveries", tags=["Deliveries"])
app.include_router(promotions.router, prefix="/api/promotions", tags=["Promotions"])
app.include_router(finance.router, prefix="/api/finance", tags=["Finance"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["Settings"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])


# WebSocket
app.include_router(ws_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": "DFL Fresh API", "version": "1.0.0"}
