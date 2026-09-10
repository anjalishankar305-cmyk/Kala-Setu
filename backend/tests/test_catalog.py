import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models import Product, Artisan
from app.services.ondc_exporter import ONDCExporter


@pytest.mark.asyncio
async def test_api_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_ondc_exporter_schema_structure():
    dummy_artisan = Artisan(
        id=1,
        pehchan_id="PEH-TEST-001",
        name="Ramesh Weaver",
        craft_type="Pochampally Ikat",
        state="Telangana",
        preferred_lang="hi"
    )
    dummy_product = Product(
        id=42,
        artisan_id=1,
        artisan=dummy_artisan,
        title_en="Pochampally Silk Saree",
        title_hi="पोचमपल्ली रेशम साड़ी",
        description_en="Handcrafted silk saree over 4 days",
        description_hi="4 दिनों में हथकरघे पर निर्मित",
        material="Mulberry Silk",
        craft_technique="Pochampally Ikat",
        production_days=4,
        raw_material_cost=1600.0,
        labor_cost=2720.0,
        suggested_price=5400.0,
        final_price=5800.0,
        ondc_synced=True
    )

    export_data = ONDCExporter.to_beckn_and_schema_org(dummy_product)
    
    # 1. Beckn context verification
    assert "context" in export_data
    assert export_data["context"]["domain"] == "ONDC:RET10"
    assert export_data["context"]["country"] == "IND"
    assert export_data["context"]["action"] == "on_search"

    # 2. Beckn catalog item verification
    catalog = export_data["message"]["catalog"]
    providers = catalog["bpp/providers"]
    assert len(providers) == 1
    items = providers[0]["items"]
    assert len(items) == 1
    item = items[0]
    assert item["id"] == "KALA-ITEM-000042"
    assert item["price"]["value"] == "5800.00"
    assert item["price"]["currency"] == "INR"

    # 3. Statutory tags verification
    tag_codes = [t["code"] for t in item["tags"]]
    assert "statutory_reqs_packaged_commodities" in tag_codes
    assert "artisan_verification" in tag_codes
    assert "bilingual_metadata" in tag_codes

    # 4. Schema.org verification
    schema_org = export_data["schema_org"]
    assert schema_org["@type"] == "Product"
    assert schema_org["name"] == "Pochampally Silk Saree"
    assert schema_org["material"] == "Mulberry Silk"
    assert schema_org["offers"]["price"] == 5800.0
    assert schema_org["offers"]["priceCurrency"] == "INR"


@pytest.mark.asyncio
async def test_speech_slot_extraction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "transcript": "यह पोचमपल्ली इकत साड़ी सिल्क से बनी है इसमें 5 दिन लगे और 1800 रुपये कच्चा माल लगा",
            "preferred_lang": "hi"
        }
        res = await ac.post("/api/speech/extract-slots", json=payload)
    
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["slots"]["production_days"] == 5
    assert data["slots"]["raw_material_cost"] == 1800.0
    assert "Silk" in data["slots"]["material"]
    assert "Ikat" in data["slots"]["craft_technique"]
    assert len(data["title_en"]) > 0
    assert len(data["title_hi"]) > 0


@pytest.mark.asyncio
async def test_artisan_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Test login with Pehchan ID
        payload = {"pehchan_id": "P-TEL-WEAV-0924"}
        res = await ac.post("/api/catalog/login", json=payload)
    
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "artisan" in data
    assert data["artisan"]["pehchan_id"] == "P-TEL-WEAV-0924"
    assert "Narsimha" in data["artisan"]["name"]
