import motor.motor_asyncio
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.config import settings
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

client: motor.motor_asyncio.AsyncIOMotorClient = None
database = None


async def connect_db():
    """Connect to local MongoDB Community Server and initialize indexes/defaults safely."""
    global client, database
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        # Verify database availability
        await client.admin.command("ping")
        database = client[settings.db_name]
        await create_indexes()
        await initialize_defaults()
        print(f"✅ Connected to MongoDB: {settings.MONGODB_URL} (database: {settings.db_name})")
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        logger.error(f"Failed to connect to MongoDB at {settings.MONGODB_URL}: {exc}")
        print(
            f"❌ Impossible de se connecter à MongoDB ({settings.MONGODB_URL}).\n"
            "   Vérifiez que le service Windows 'MongoDB' est démarré :\n"
            "   PowerShell: Start-Service MongoDB"
        )
        raise RuntimeError(
            f"MongoDB connection failed at {settings.MONGODB_URL}. "
            "Ensure MongoDB Community Server Windows Service is running."
        ) from exc


async def close_db():
    global client
    if client:
        client.close()
        print("❌ MongoDB connection closed")


async def get_database():
    return database


async def create_indexes():
    """Create indexes idempotently without modifying existing data."""
    db = database
    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    # Products
    await db.products.create_index("name_fr")
    await db.products.create_index("category_id")
    await db.products.create_index("is_active")
    # Categories
    await db.categories.create_index("slug", unique=True)
    # Orders
    await db.orders.create_index("order_number", unique=True)
    await db.orders.create_index("status")
    await db.orders.create_index("customer_id")
    await db.orders.create_index("created_at")
    # Stock movements
    await db.stock_movements.create_index("product_id")
    await db.stock_movements.create_index("created_at")
    # Audit logs
    await db.audit_logs.create_index("user_id")
    await db.audit_logs.create_index("created_at")
    await db.audit_logs.create_index("module")


async def initialize_defaults():
    """Initialize Super Admin, default categories, and settings only if missing."""
    from app.core.security import get_password_hash

    # 1. Super Admin (only if no administrator exists)
    admin = await database.users.find_one({"role": "administrator"})
    if not admin:
        await database.users.insert_one({
            "full_name": "Administrateur DFL Fresh",
            "email": "admin@dflfresh.ma",
            "phone": "+212600000000",
            "password_hash": get_password_hash("Admin@2024!"),
            "role": "administrator",
            "permissions": {},
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })
        print("✅ Default admin created: admin@dflfresh.ma / Admin@2024!")

    # 2. Default categories (only insert missing slugs)
    default_categories = [
        {"name": "Légumes", "name_ar": "خضار", "slug": "legumes", "icon": "🥦", "order": 1, "is_active": True},
        {"name": "Fruits", "name_ar": "فواكه", "slug": "fruits", "icon": "🍎", "order": 2, "is_active": True},
        {"name": "Fruits Exotiques", "name_ar": "فواكه استوائية", "slug": "fruits-exotiques", "icon": "🥭", "order": 3, "is_active": True},
        {"name": "Herbes", "name_ar": "أعشاب", "slug": "herbes", "icon": "🌿", "order": 4, "is_active": True},
        {"name": "Paniers Prêts", "name_ar": "سلال جاهزة", "slug": "paniers-prets", "icon": "🧺", "order": 5, "is_active": True},
    ]
    for cat in default_categories:
        existing = await database.categories.find_one({"slug": cat["slug"]})
        if not existing:
            cat["created_at"] = datetime.now(timezone.utc)
            await database.categories.insert_one(cat)

    # 3. Default application settings (only if missing)
    existing_settings = await database.settings.find_one({"key": "app_settings"})
    if not existing_settings:
        await database.settings.insert_one({
            "key": "app_settings",
            "company_name": "DFL Fresh",
            "company_address": "Maroc",
            "company_phone": "+212600000000",
            "company_email": "contact@dflfresh.ma",
            "currency": "DH",
            "delivery_fee": 15.0,
            "min_order_amount": 50.0,
            "free_delivery_threshold": 200.0,
            "delivery_time_slots": ["08:00-12:00", "12:00-16:00", "16:00-20:00"],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })
