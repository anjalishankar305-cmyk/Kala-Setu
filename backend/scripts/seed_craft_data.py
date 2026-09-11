import asyncio
import sys
from pathlib import Path

# Add backend dir to sys.path so app imports work when run standalone
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal, init_db
from app.models import CraftBenchmark, Artisan, Product

BENCHMARKS_DATA = [
    {
        "craft_name": "Pochampally Ikat",
        "base_material": "Mulberry & Tussar Silk",
        "state": "Telangana",
        "notified_daily_wage": 680.0,
        "typical_days_range_min": 3,
        "typical_days_range_max": 8,
        "market_floor_price": 3800.0,
        "market_ceiling_price": 9500.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Channapatna Toys",
        "base_material": "Wrightia Tinctoria Ivory Wood & Lacquer",
        "state": "Karnataka",
        "notified_daily_wage": 650.0,
        "typical_days_range_min": 1,
        "typical_days_range_max": 3,
        "market_floor_price": 950.0,
        "market_ceiling_price": 2800.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Madhubani Painting",
        "base_material": "Handmade Paper & Natural Twig Dyes",
        "state": "Bihar",
        "notified_daily_wage": 540.0,
        "typical_days_range_min": 2,
        "typical_days_range_max": 6,
        "market_floor_price": 1800.0,
        "market_ceiling_price": 5500.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Dhokra Bell Metal",
        "base_material": "Lost-Wax Brass & Bronze Alloy",
        "state": "Chhattisgarh",
        "notified_daily_wage": 560.0,
        "typical_days_range_min": 4,
        "typical_days_range_max": 10,
        "market_floor_price": 2800.0,
        "market_ceiling_price": 8500.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Kutch Ajrakh Block Print",
        "base_material": "Indigo Dyed Desi Organic Cotton",
        "state": "Gujarat",
        "notified_daily_wage": 610.0,
        "typical_days_range_min": 3,
        "typical_days_range_max": 7,
        "market_floor_price": 2200.0,
        "market_ceiling_price": 6000.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Banarasi Brocade",
        "base_material": "Katan Silk & Electroplated Gold Zari",
        "state": "Uttar Pradesh",
        "notified_daily_wage": 580.0,
        "typical_days_range_min": 5,
        "typical_days_range_max": 15,
        "market_floor_price": 6500.0,
        "market_ceiling_price": 22000.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Blue Pottery",
        "base_material": "Quartz Powder, Multani Mitti & Cobalt Glaze",
        "state": "Rajasthan",
        "notified_daily_wage": 620.0,
        "typical_days_range_min": 2,
        "typical_days_range_max": 5,
        "market_floor_price": 1400.0,
        "market_ceiling_price": 4200.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Kullu Shawls",
        "base_material": "Pure Indigenous Merino Sheep Wool",
        "state": "Himachal Pradesh",
        "notified_daily_wage": 640.0,
        "typical_days_range_min": 3,
        "typical_days_range_max": 7,
        "market_floor_price": 3200.0,
        "market_ceiling_price": 8900.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Bastar Iron Craft",
        "base_material": "Hand-Forged Charcoal Recycled Iron",
        "state": "Chhattisgarh",
        "notified_daily_wage": 560.0,
        "typical_days_range_min": 2,
        "typical_days_range_max": 5,
        "market_floor_price": 1600.0,
        "market_ceiling_price": 4800.0,
        "gi_tagged": True
    },
    {
        "craft_name": "Mysore Silk",
        "base_material": "100% Pure Mulberry Silk & 0.65% Silver Zari",
        "state": "Karnataka",
        "notified_daily_wage": 650.0,
        "typical_days_range_min": 4,
        "typical_days_range_max": 9,
        "market_floor_price": 7500.0,
        "market_ceiling_price": 24000.0,
        "gi_tagged": True
    }
]

ARTISANS_DATA = [
    {
        "pehchan_id": "P-TEL-WEAV-0924",
        "name": "Narsimha Chary",
        "craft_type": "Pochampally Ikat Handloom",
        "state": "Telangana",
        "phone": "+91 98480 12345",
        "preferred_lang": "hi"
    },
    {
        "pehchan_id": "P-BIH-FOLK-1142",
        "name": "Sita Devi Paswan",
        "craft_type": "Mithila Madhubani Painting",
        "state": "Bihar",
        "phone": "+91 94310 56789",
        "preferred_lang": "hi"
    },
    {
        "pehchan_id": "P-CHH-METL-3319",
        "name": "Budhram Baghel",
        "craft_type": "Dhokra Bell Metal Craft",
        "state": "Chhattisgarh",
        "phone": "+91 97520 89123",
        "preferred_lang": "hi"
    },
    {
        "pehchan_id": "P-KAR-WOOD-4401",
        "name": "Kavitha Gowda",
        "craft_type": "Channapatna Lacquer Woodcraft",
        "state": "Karnataka",
        "phone": "+91 99001 44556",
        "preferred_lang": "en"
    }
]

SAMPLE_PRODUCTS = [
    {
        "artisan_index": 0,
        "title_en": "Authentic Pochampally Ikat Silk Saree - Geometric Double Ikat",
        "title_hi": "प्रामाणिक पोचमपल्ली इकत सिल्क साड़ी - ज्यामितीय डबल इकत",
        "description_en": (
            "• Craft Cluster: Pochampally Ikat traditional heritage craftsmanship (GI Tagged).\n"
            "• Primary Material: 100% Mulberry & Tussar Silk with natural resist tie-and-dye.\n"
            "• Artisan Labor: Handcrafted over 5 full working days by registered master weaver.\n"
            "• Raw Material Investment: Certified investment of ₹1,800.00.\n"
            "• Origin & Compliance: Handcrafted in Bhoodan Pochampally, Telangana. MoSJE Fair Wage Guarantee verified."
        ),
        "description_hi": (
            "• शिल्प परंपरा: प्रामाणिक पोचमपल्ली इकत हथकरघा धरोहर (जीआई टैग प्रमाणित)।\n"
            "• मुख्य सामग्री: 100% शुद्ध शहतूत व टसर रेशम।\n"
            "• कारीगरी श्रम: 5 दिन के बारीक करघा कार्य द्वारा निर्मित।\n"
            "• कच्ची सामग्री लागत: ₹1,800.00 का शुद्ध कच्चा माल।\n"
            "• उद्गम व निष्पक्षता: तेलंगाना में निर्मित। सामाजिक न्याय एवं अधिकारिता मंत्रालय उचित पारिश्रमिक मानदंड द्वारा प्रमाणित।"
        ),
        "material": "Mulberry & Tussar Silk",
        "craft_technique": "Pochampally Ikat Handloom Weaving",
        "production_days": 5,
        "raw_material_cost": 1800.0,
        "labor_cost": 3400.0,
        "suggested_price": 6500.0,
        "final_price": 6800.0,
        "ondc_synced": True,
        "raw_image_path": "/uploads/raw/sample_ikat.jpg",
        "processed_image_path": "/uploads/processed/sample_ikat_studio.jpg"
    },
    {
        "artisan_index": 1,
        "title_en": "Traditional Madhubani Tree of Life Painting on Handmade Lokta Paper",
        "title_hi": "पारंपरिक मधुबनी जीवन वृक्ष (ट्री ऑफ लाइफ) लोक चित्रकला",
        "description_en": (
            "• Craft Cluster: Mithila Madhubani Folk Art (GI Tagged).\n"
            "• Primary Material: Natural mineral & plant pigment dyes on sun-cured handmade paper.\n"
            "• Artisan Labor: Intricately penned over 3 full working days using fine bamboo nibs.\n"
            "• Raw Material Investment: Certified investment of ₹650.00.\n"
            "• Origin & Compliance: Madhubani, Bihar. Guaranteed zero toxic chemicals."
        ),
        "description_hi": (
            "• शिल्प परंपरा: मिथिला मधुबनी लोक कला (जीआई टैग)।\n"
            "• मुख्य सामग्री: प्राकृतिक वानस्पतिक रंगों द्वारा हस्तनिर्मित कागज़ पर चित्रण।\n"
            "• कारीगरी श्रम: 3 दिनों के निरंतर बारीक रेखांकन द्वारा निर्मित।\n"
            "• कच्ची सामग्री लागत: ₹650.00।\n"
            "• उद्गम: बिहार। उचित पारिश्रमिक द्वारा समर्थित।"
        ),
        "material": "Natural Dyes & Lokta Paper",
        "craft_technique": "Mithila Madhubani Folk Art",
        "production_days": 3,
        "raw_material_cost": 650.0,
        "labor_cost": 1620.0,
        "suggested_price": 2850.0,
        "final_price": 2900.0,
        "ondc_synced": True,
        "raw_image_path": "/uploads/raw/sample_madhubani.jpg",
        "processed_image_path": "/uploads/processed/sample_madhubani_studio.jpg"
    },
    {
        "artisan_index": 2,
        "title_en": "Dhokra Lost-Wax Bell Metal Nandi Bull Tribal Figurine",
        "title_hi": "ढोकरा धातु ढलाई नंदी बैल जनजातीय शिल्प प्रतिमा",
        "description_en": (
            "• Craft Cluster: Bastar Dhokra Lost-Wax Non-Ferrous Metal Casting.\n"
            "• Primary Material: Handcrafted Brass and Bell Metal scrap alloy.\n"
            "• Artisan Labor: Handcrafted over 4 days using clay core and natural beeswax threads.\n"
            "• Raw Material Investment: Certified investment of ₹950.00.\n"
            "• Origin & Compliance: Bastar, Chhattisgarh. Fair wage guaranteed."
        ),
        "description_hi": (
            "• शिल्प परंपरा: बस्तर ढोकरा प्राचीन धातु ढलाई (लॉस्ट-वैक्स)।\n"
            "• मुख्य सामग्री: पीतल व कांसा मिश्र धातु (बेल मेटल)।\n"
            "• कारीगरी श्रम: मिट्टी और मोम के सांचे से 4 दिन में तैयार।\n"
            "• कच्ची सामग्री लागत: ₹950.00।\n"
            "• उद्गम: छत्तीसगढ़।"
        ),
        "material": "Dhokra Bell Metal Brass",
        "craft_technique": "Lost-Wax Dhokra Metal Casting",
        "production_days": 4,
        "raw_material_cost": 950.0,
        "labor_cost": 2240.0,
        "suggested_price": 3990.0,
        "final_price": 4200.0,
        "ondc_synced": False,
        "raw_image_path": "/uploads/raw/sample_dhokra.jpg",
        "processed_image_path": "/uploads/processed/sample_dhokra_studio.jpg"
    }
]


async def seed_data(session: AsyncSession = None) -> None:
    """Seed benchmark craft data, sample artisans, and showcase products."""
    close_session_at_end = False
    if session is None:
        await init_db()
        session = AsyncSessionLocal()
        close_session_at_end = True

    try:
        # 1. Seed benchmarks
        for item in BENCHMARKS_DATA:
            existing = await session.execute(
                select(CraftBenchmark).where(CraftBenchmark.craft_name == item["craft_name"])
            )
            if not existing.scalars().first():
                benchmark = CraftBenchmark(**item)
                session.add(benchmark)

        await session.commit()

        # 2. Seed artisans
        created_artisans = []
        for art_data in ARTISANS_DATA:
            existing_art = await session.execute(
                select(Artisan).where(Artisan.pehchan_id == art_data["pehchan_id"])
            )
            art_obj = existing_art.scalars().first()
            if not art_obj:
                art_obj = Artisan(**art_data)
                session.add(art_obj)
                await session.commit()
                await session.refresh(art_obj)
            created_artisans.append(art_obj)

        # 3. Seed sample products
        for prod_info in SAMPLE_PRODUCTS:
            art_idx = prod_info["artisan_index"]
            artisan = created_artisans[art_idx] if art_idx < len(created_artisans) else created_artisans[0]

            existing_prod = await session.execute(
                select(Product).where(Product.title_en == prod_info["title_en"])
            )
            prod_obj = existing_prod.scalars().first()
            if not prod_obj:
                prod_dict = {k: v for k, v in prod_info.items() if k != "artisan_index"}
                prod_dict["artisan_id"] = artisan.id
                product = Product(**prod_dict)
                session.add(product)
            else:
                prod_obj.title_hi = prod_info["title_hi"]
                prod_obj.description_hi = prod_info["description_hi"]
                session.add(prod_obj)

        await session.commit()
        print("Successfully seeded KalaSetu craft benchmarks, artisans, and sample catalog products.")
    finally:
        if close_session_at_end:
            await session.close()


if __name__ == "__main__":
    asyncio.run(seed_data())
