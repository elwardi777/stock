"""Idempotent seed script to populate DFL Fresh MongoDB with 15 realistic products."""
import asyncio
from datetime import datetime, timezone
import os
import sys

# Ensure backend/app is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
import motor.motor_asyncio


DEFAULT_CATEGORIES = [
    {"name": "Légumes", "name_ar": "خضار", "slug": "legumes", "icon": "🥦", "order": 1, "is_active": True},
    {"name": "Fruits", "name_ar": "فواكه", "slug": "fruits", "icon": "🍎", "order": 2, "is_active": True},
    {"name": "Fruits Exotiques", "name_ar": "فواكه استوائية", "slug": "fruits-exotiques", "icon": "🥭", "order": 3, "is_active": True},
    {"name": "Herbes", "name_ar": "أعشاب", "slug": "herbes", "icon": "🌿", "order": 4, "is_active": True},
    {"name": "Paniers Prêts", "name_ar": "سلال جاهزة", "slug": "paniers-prets", "icon": "🧺", "order": 5, "is_active": True},
]


PRODUCTS = [
    # --- Légumes (5) ---
    {
        "slug": "tomates-rondes",
        "category_slug": "legumes",
        "name_fr": "Tomates Rondes",
        "name_ar": "طماطم دائرية",
        "description": "Tomates rondes bien mûres et juteuses, récoltées chaque matin pour vos salades et tajines.",
        "description_ar": "طماطم طازجة وناضجة مقطوفة كل صباح، مثالية للسلطات والطواجن.",
        "purchase_price": 4.0,
        "selling_price": 6.5,
        "unit": "kg",
        "quantity": 120.0,
        "stock_threshold": 20.0,
        "image_url": "/uploads/products/tomates-rondes.jpg",
    },
    {
        "slug": "pommes-de-terre",
        "category_slug": "legumes",
        "name_fr": "Pommes de Terre",
        "name_ar": "بطاطس",
        "description": "Pommes de terre fermes et savoureuses, idéales pour la cuisson au four, les frites ou les plats mijotés.",
        "description_ar": "بطاطس طازجة متماسكة ولذيذة، مثالية للقلي والفرن والأطباق المغربية.",
        "purchase_price": 3.5,
        "selling_price": 5.5,
        "unit": "kg",
        "quantity": 180.0,
        "stock_threshold": 25.0,
        "image_url": "/uploads/products/pommes-de-terre.jpg",
    },
    {
        "slug": "carottes",
        "category_slug": "legumes",
        "name_fr": "Carottes",
        "name_ar": "جزر",
        "description": "Carottes fraîches et croquantes riches en vitamines, parfaites pour jus, couscous et salades.",
        "description_ar": "جزر طازج ومقرمش غني بالفيتامينات، مثالي للعصائر والكسكس والسلطات.",
        "purchase_price": 3.5,
        "selling_price": 5.5,
        "unit": "kg",
        "quantity": 0.0,  # Rupture de stock
        "stock_threshold": 15.0,
        "image_url": "/uploads/products/carottes.jpg",
    },
    {
        "slug": "oignons",
        "category_slug": "legumes",
        "name_fr": "Oignons",
        "name_ar": "بصل",
        "description": "Oignons jaunes secs de qualité supérieure, indispensables pour relever toutes vos préparations culinaires.",
        "description_ar": "بصل أصفر جاف عالي الجودة، أساسي لإعداد مختلف الأطباق اليومية.",
        "purchase_price": 5.0,
        "selling_price": 8.0,
        "unit": "kg",
        "quantity": 95.0,
        "stock_threshold": 15.0,
        "image_url": "/uploads/products/oignons.jpg",
    },
    {
        "slug": "concombres",
        "category_slug": "legumes",
        "name_fr": "Concombres",
        "name_ar": "خيار",
        "description": "Concombres verts frais et croquants, rafraîchissants pour vos salades et entrées d'été.",
        "description_ar": "خيار أخضر طازج ومقرمش، منعش للسلطات والمقبلات.",
        "purchase_price": 4.5,
        "selling_price": 7.0,
        "unit": "kg",
        "quantity": 65.0,
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/concombres.jpg",
    },
    # --- Fruits (5) ---
    {
        "slug": "pommes-rouges",
        "category_slug": "fruits",
        "name_fr": "Pommes Rouges",
        "name_ar": "تفاح أحمر",
        "description": "Pommes rouges croquantes et sucrées, sélectionnées auprès des meilleurs vergers de l'Atlas.",
        "description_ar": "تفاح أحمر مقرمش وحلو المذاق منتقى من أجود بساتين الأطلس.",
        "purchase_price": 8.5,
        "selling_price": 13.0,
        "unit": "kg",
        "quantity": 75.0,
        "stock_threshold": 15.0,
        "image_url": "/uploads/products/pommes-rouges.jpg",
    },
    {
        "slug": "bananes",
        "category_slug": "fruits",
        "name_fr": "Bananes",
        "name_ar": "موز",
        "description": "Bananes douces et énergétiques à maturité optimale, idéales pour le petit-déjeuner et les smoothies.",
        "description_ar": "موز حلو وغني بالطاقة ناضج تماماً، مثالي للفطور والعصائر.",
        "purchase_price": 9.0,
        "selling_price": 14.0,
        "unit": "kg",
        "quantity": 60.0,
        "stock_threshold": 12.0,
        "image_url": "/uploads/products/bananes.jpg",
    },
    {
        "slug": "oranges",
        "category_slug": "fruits",
        "name_fr": "Oranges",
        "name_ar": "برتقال",
        "description": "Oranges juteuses et parfumées gorgées de vitamine C, parfaites à déguster ou presser.",
        "description_ar": "برتقال عصيري وعطري غني بفيتامين سي، مثالي للأكل أو للعصر.",
        "purchase_price": 4.5,
        "selling_price": 7.5,
        "unit": "kg",
        "quantity": 140.0,
        "stock_threshold": 20.0,
        "image_url": "/uploads/products/oranges.jpg",
    },
    {
        "slug": "avocats",
        "category_slug": "fruits",
        "name_fr": "Avocats",
        "name_ar": "أفوكادو",
        "description": "Avocats crémeux et fondants, riches en bons nutriments pour vos smoothies, toasts et salades.",
        "description_ar": "أفوكادو كريمي وناضج غني بالعناصر الغذائية، مثالي للعصائر والسلطات.",
        "purchase_price": 18.0,
        "selling_price": 26.0,
        "unit": "kg",
        "quantity": 6.0,  # Stock faible
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/avocats.jpg",
    },
    {
        "slug": "fraises",
        "category_slug": "fruits",
        "name_fr": "Fraises",
        "name_ar": "فراولة",
        "description": "Fraises rouges parfumées et sucrées de saison, cueillies avec soin le matin même.",
        "description_ar": "فراولة حمراء حلوة وعطرية موسمية مقطوفة بعناية في نفس الصباح.",
        "purchase_price": 14.0,
        "selling_price": 22.0,
        "unit": "kg",
        "quantity": 4.0,  # Stock faible
        "stock_threshold": 8.0,
        "image_url": "/uploads/products/fraises.jpg",
    },
    # --- Fruits Exotiques (2) ---
    {
        "slug": "mangues",
        "category_slug": "fruits-exotiques",
        "name_fr": "Mangues",
        "name_ar": "مانجو",
        "description": "Mangues exotiques charnues et très parfumées, à la chair douce et juteuse.",
        "description_ar": "مانجو استوائي لحمي وعطري بمذاق حلو وعصيري.",
        "purchase_price": 22.0,
        "selling_price": 32.0,
        "unit": "kg",
        "quantity": 5.0,  # Stock faible
        "stock_threshold": 8.0,
        "image_url": "/uploads/products/mangues.jpg",
    },
    {
        "slug": "ananas",
        "category_slug": "fruits-exotiques",
        "name_fr": "Ananas",
        "name_ar": "أناناس",
        "description": "Ananas entier doré et sucré, idéal pour vos desserts frais et jus exotiques.",
        "description_ar": "أناناس كامل ذهبي وحلو المذاق، مثالي للحلويات والعصائر الاستوائية.",
        "purchase_price": 16.0,
        "selling_price": 25.0,
        "unit": "piece",
        "quantity": 0.0,  # Rupture de stock
        "stock_threshold": 6.0,
        "image_url": "/uploads/products/ananas.jpg",
    },
    # --- Herbes (2) ---
    {
        "slug": "persil",
        "category_slug": "herbes",
        "name_fr": "Persil",
        "name_ar": "بقدونس",
        "description": "Botte de persil plat frais et aromatique, récolté quotidiennement.",
        "description_ar": "ربطة بقدونس طازج وعطري مقطوف يومياً.",
        "purchase_price": 1.0,
        "selling_price": 2.5,
        "unit": "botte",
        "quantity": 85.0,
        "stock_threshold": 15.0,
        "image_url": "/uploads/products/persil.jpg",
    },
    {
        "slug": "coriandre",
        "category_slug": "herbes",
        "name_fr": "Coriandre",
        "name_ar": "كزبرة",
        "description": "Botte de coriandre fraîche et parfumée, incontournable pour la cuisine marocaine.",
        "description_ar": "ربطة كزبرة طازجة وعطرية لا غنى عنها في المطبخ المغربي.",
        "purchase_price": 1.0,
        "selling_price": 2.5,
        "unit": "botte",
        "quantity": 90.0,
        "stock_threshold": 15.0,
        "image_url": "/uploads/products/coriandre.jpg",
    },
    # --- Paniers Prêts (1) ---
    {
        "slug": "panier-familial-mix",
        "category_slug": "paniers-prets",
        "name_fr": "Panier Familial Mix",
        "name_ar": "سلة عائلية متنوعة",
        "description": "Panier complet de fruits et légumes frais de saison (10 kg assortis) préparé pour toute la famille.",
        "description_ar": "سلة متكاملة من الفواكه والخضروات الموسمية الطازجة (10 كغ متنوعة) لجميع أفراد العائلة.",
        "purchase_price": 105.0,
        "selling_price": 150.0,
        "unit": "panier",
        "quantity": 25.0,
        "stock_threshold": 5.0,
        "image_url": "/uploads/products/panier-familial.jpg",
    },
    # --- Additional 15 Products ---
    # Légumes (5)
    {
        "slug": "poivrons-verts",
        "category_slug": "legumes",
        "name_fr": "Poivrons Verts",
        "name_ar": "فلفل أخضر",
        "description": "Poivrons verts frais et charnus, parfaits pour vos tajines, grillades et salades marocaines.",
        "description_ar": "فلفل أخضر طازج ولحمي، مثالي للطواجن والمشويات والسلطات المغربية.",
        "purchase_price": 6.0,
        "selling_price": 9.5,
        "unit": "kg",
        "quantity": 70.0,
        "stock_threshold": 15.0,
        "image_url": "/uploads/products/poivrons-verts.jpg",
    },
    {
        "slug": "aubergines",
        "category_slug": "legumes",
        "name_fr": "Aubergines",
        "name_ar": "الباذنجان",
        "description": "Aubergines violettes brillantes et tendres, idéales pour le zaalouk, les gratins et les poêlées.",
        "description_ar": "باذنجان طازج ولامع مثالي لتحضير الزعلوك والغراتان والأطباق المشوية.",
        "purchase_price": 4.5,
        "selling_price": 7.5,
        "unit": "kg",
        "quantity": 55.0,
        "stock_threshold": 12.0,
        "image_url": "/uploads/products/aubergines.jpg",
    },
    {
        "slug": "courgettes",
        "category_slug": "legumes",
        "name_fr": "Courgettes",
        "name_ar": "الكوسة",
        "description": "Courgettes vertes tendres et savoureuses, récoltées jeunes pour vos couscous et soupes.",
        "description_ar": "كوسة خضراء طرية ولذيذة مثالية للكسكس والشوربات والأطباق الصحية.",
        "purchase_price": 5.0,
        "selling_price": 8.5,
        "unit": "kg",
        "quantity": 7.0,  # Stock faible
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/courgettes.jpg",
    },
    {
        "slug": "chou-fleur",
        "category_slug": "legumes",
        "name_fr": "Chou-Fleur",
        "name_ar": "القرنبيط",
        "description": "Chou-fleur blanc bien serré et croquant, idéal en gratin, vapeur ou beignets.",
        "description_ar": "قرنبيط أبيض طازج ومتماسك، مثالي للطبخ بالبخار أو في الفرن.",
        "purchase_price": 6.0,
        "selling_price": 10.0,
        "unit": "piece",
        "quantity": 0.0,  # Rupture de stock
        "stock_threshold": 8.0,
        "image_url": "/uploads/products/chou-fleur.jpg",
    },
    {
        "slug": "laitue",
        "category_slug": "legumes",
        "name_fr": "Laitue",
        "name_ar": "الخس",
        "description": "Laitue verte croquante et fraîche du jour, idéale pour composer des salades légères.",
        "description_ar": "خس أخضر طازج ومقرمش مقطوف اليوم، مثالي لتحضير السلطات المنعشة.",
        "purchase_price": 2.0,
        "selling_price": 4.0,
        "unit": "piece",
        "quantity": 45.0,
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/laitue.jpg",
    },
    # Fruits (4)
    {
        "slug": "poires",
        "category_slug": "fruits",
        "name_fr": "Poires",
        "name_ar": "الإجاص",
        "description": "Poires juteuses, sucrées et fondantes, idéales à croquer ou en desserts.",
        "description_ar": "إجاص حلو وعصيري ناضج، مثالي للأكل الطازج والحلويات.",
        "purchase_price": 11.0,
        "selling_price": 16.5,
        "unit": "kg",
        "quantity": 50.0,
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/poires.jpg",
    },
    {
        "slug": "raisins",
        "category_slug": "fruits",
        "name_fr": "Raisins",
        "name_ar": "العنب",
        "description": "Grappes de raisins doux et croquants, riches en antioxydants naturels.",
        "description_ar": "عناقيد عنب حلوة ومقرمشة غنية بمضادات الأكسدة الطبيعية.",
        "purchase_price": 12.0,
        "selling_price": 18.0,
        "unit": "kg",
        "quantity": 38.0,
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/raisins.jpg",
    },
    {
        "slug": "citrons",
        "category_slug": "fruits",
        "name_fr": "Citrons",
        "name_ar": "الحامض",
        "description": "Citrons jaunes très juteux et parfumés, parfaits pour vos jus, assaisonnements et tajines.",
        "description_ar": "حامض أصفر عصيري وعطري، مثالي للعصائر والتتبيلات والطواجن.",
        "purchase_price": 4.0,
        "selling_price": 7.0,
        "unit": "kg",
        "quantity": 110.0,
        "stock_threshold": 15.0,
        "image_url": "/uploads/products/citrons.jpg",
    },
    {
        "slug": "peches",
        "category_slug": "fruits",
        "name_fr": "Pêches",
        "name_ar": "الخوخ",
        "description": "Pêches veloutées, sucrées et parfumées de saison, récoltées à pleine maturité.",
        "description_ar": "خوخ موسمي حلو وعطري مقطوف عند تمام النضج.",
        "purchase_price": 10.0,
        "selling_price": 15.5,
        "unit": "kg",
        "quantity": 5.0,  # Stock faible
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/peches.jpg",
    },
    # Fruits Exotiques (3)
    {
        "slug": "papaye",
        "category_slug": "fruits-exotiques",
        "name_fr": "Papaye",
        "name_ar": "البابايا",
        "description": "Papaye exotique à la chair orangée douce et parfumée, riche en vitamines.",
        "description_ar": "بابايا استوائية بلب برتقالي ناعم وعطري غني بالفيتامينات.",
        "purchase_price": 20.0,
        "selling_price": 30.0,
        "unit": "kg",
        "quantity": 18.0,
        "stock_threshold": 5.0,
        "image_url": "/uploads/products/papaye.jpg",
    },
    {
        "slug": "kiwi",
        "category_slug": "fruits-exotiques",
        "name_fr": "Kiwi",
        "name_ar": "الكيوي",
        "description": "Kiwis frais acidulés et riches en vitamine C, parfaits pour faire le plein d'énergie.",
        "description_ar": "كيوي طازج غني بفيتامين سي، مثالي للفطور وتقوية المناعة.",
        "purchase_price": 19.0,
        "selling_price": 28.0,
        "unit": "kg",
        "quantity": 4.0,  # Stock faible
        "stock_threshold": 8.0,
        "image_url": "/uploads/products/kiwi.jpg",
    },
    {
        "slug": "fruit-du-dragon",
        "category_slug": "fruits-exotiques",
        "name_fr": "Fruit du Dragon",
        "name_ar": "فاكهة التنين",
        "description": "Pitaya (fruit du dragon) frais et exotique à la chair délicate et légèrement sucrée.",
        "description_ar": "فاكهة التنين الاستوائية الطازجة بلب ناعم ومذاق خفيف ومنعش.",
        "purchase_price": 35.0,
        "selling_price": 52.0,
        "unit": "piece",
        "quantity": 0.0,  # Rupture de stock
        "stock_threshold": 5.0,
        "image_url": "/uploads/products/fruit-dragon.jpg",
    },
    # Herbes (2)
    {
        "slug": "menthe-fraiche",
        "category_slug": "herbes",
        "name_fr": "Menthe Fraîche",
        "name_ar": "النعناع الطازج",
        "description": "Botte de menthe fraîche très aromatique, indispensable pour le thé marocain et les infusions.",
        "description_ar": "ربطة نعناع طازج وعطري، أساسي لتحضير الشاي المغربي الأصيل.",
        "purchase_price": 1.0,
        "selling_price": 2.5,
        "unit": "botte",
        "quantity": 130.0,
        "stock_threshold": 20.0,
        "image_url": "/uploads/products/menthe-fraiche.jpg",
    },
    {
        "slug": "basilic",
        "category_slug": "herbes",
        "name_fr": "Basilic",
        "name_ar": "الريحان",
        "description": "Botte de basilic frais parfumé, idéal pour vos sauces, pâtes et salades estivales.",
        "description_ar": "ربطة ريحان طازج وعطري، مثالي للصلصات والمعكرونة والسلطات.",
        "purchase_price": 2.0,
        "selling_price": 4.5,
        "unit": "botte",
        "quantity": 40.0,
        "stock_threshold": 10.0,
        "image_url": "/uploads/products/basilic.jpg",
    },
    # Paniers Prêts (1)
    {
        "slug": "panier-premium-fruits",
        "category_slug": "paniers-prets",
        "name_fr": "Panier Premium Fruits",
        "name_ar": "سلة الفواكه الممتازة",
        "description": "Assortiment premium de fruits de saison et exotiques soigneusement sélectionnés (8 kg).",
        "description_ar": "سلة فواكه ممتازة ومتنوعة من الفواكه الموسمية والاستوائية المنتقاة بعناية (8 كغ).",
        "purchase_price": 145.0,
        "selling_price": 210.0,
        "unit": "panier",
        "quantity": 16.0,
        "stock_threshold": 4.0,
        "image_url": "/uploads/products/panier-premium-fruits.jpg",
    },
]


async def seed():
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
    await client.admin.command("ping")
    db = client[settings.db_name]

    # Ensure unique sparse index on slug
    await db.products.create_index("slug", unique=True, sparse=True)

    # Ensure categories exist and map slug -> str(_id)
    category_map = {}
    for cat in DEFAULT_CATEGORIES:
        existing = await db.categories.find_one({"slug": cat["slug"]})
        if not existing:
            doc = {**cat, "created_at": datetime.now(timezone.utc)}
            res = await db.categories.insert_one(doc)
            category_map[cat["slug"]] = str(res.inserted_id)
        else:
            category_map[cat["slug"]] = str(existing["_id"])

    inserted = 0
    skipped = 0
    now = datetime.now(timezone.utc)

    for prod in PRODUCTS:
        existing = await db.products.find_one({"slug": prod["slug"]})
        if existing:
            skipped += 1
            print(f"[SKIP] {prod['name_fr']} (already exists)")
            continue

        doc = {
            "slug": prod["slug"],
            "name_fr": prod["name_fr"],
            "name_ar": prod["name_ar"],
            "description": prod["description"],
            "description_ar": prod["description_ar"],
            "category_id": category_map[prod["category_slug"]],
            "purchase_price": prod["purchase_price"],
            "selling_price": prod["selling_price"],
            "unit": prod["unit"],
            "quantity": prod["quantity"],
            "stock_threshold": prod["stock_threshold"],
            "is_active": True,
            "is_visible": True,
            "image_url": prod["image_url"],
            "created_at": now,
            "updated_at": now,
        }
        await db.products.insert_one(doc)
        inserted += 1
        print(f"[INSERTED] {prod['name_fr']} ({prod['selling_price']} DH/{prod['unit']}, qty={prod['quantity']})")

    total_products = await db.products.count_documents({})
    print(f"\nSummary: inserted={inserted}, skipped={skipped}, total_in_db={total_products}")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())

