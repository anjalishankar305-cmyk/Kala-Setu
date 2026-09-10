import sys
import httpx
import json
from io import BytesIO
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

def run_live_verification():
    print("=" * 60)
    print(" KalaSetu Live Full-Stack End-to-End Test")
    print("=" * 60)

    # 1. Backend Health
    print("\n1. Testing Backend Health (http://127.0.0.1:8000/api/health)...")
    with httpx.Client(base_url="http://127.0.0.1:8000", timeout=10.0) as client:
        res = client.get("/api/health")
        print(f"   Status: {res.status_code} {res.json()}")
        assert res.status_code == 200

        # 2. Craft Benchmarks
        print("\n2. Testing Craft Benchmarks (/api/pricing/benchmarks)...")
        res = client.get("/api/pricing/benchmarks")
        benchmarks = res.json()
        print(f"   Status: {res.status_code} | Found {len(benchmarks)} Indian craft clusters.")
        for b in benchmarks[:3]:
            print(f"   - {b['craft_name']} ({b['state']}): Daily Wage=₹{b['notified_daily_wage']}, Typical Range: ₹{b['market_floor_price']} - ₹{b['market_ceiling_price']}")
        assert len(benchmarks) >= 10

        # 3. Grounded Fair Wage Pricing Engine
        print("\n3. Testing Grounded Pricing Engine (/api/pricing/calculate)...")
        pricing_payload = {
            "craft_name": "Pochampally Ikat",
            "state": "Telangana",
            "production_days": 4,
            "raw_material_cost": 1600.0
        }
        res = client.post("/api/pricing/calculate", json=pricing_payload)
        pricing_data = res.json()
        print(f"   Status: {res.status_code}")
        print(f"   • Cost Floor (Break-even): ₹{pricing_data['cost_floor']:,.2f}")
        print(f"   • Fair Trade Price (+25% margin): ₹{pricing_data['fair_trade_price']:,.2f}")
        print(f"   • Market Ceiling: ₹{pricing_data['market_ceiling']:,.2f}")
        print(f"   • Recommended Range: ₹{pricing_data['recommended_range']}")
        print(f"   • Hindi Explanation: {pricing_data['explanation_hi']}")
        assert pricing_data["fair_trade_price"] > pricing_data["cost_floor"]

        # 4. Indic Speech Slot-Filler & Bilingual Metadata
        print("\n4. Testing Speech & NLP Slot Extraction (/api/speech/extract-slots)...")
        voice_payload = {
            "transcript": "यह पोचमपल्ली इकत साड़ी शुद्ध सिल्क से बनी है, इसे तैयार करने में 5 दिन लगे और 1800 रुपये कच्चा माल लगा",
            "preferred_lang": "hi"
        }
        res = client.post("/api/speech/extract-slots", json=voice_payload)
        nlp_data = res.json()
        print(f"   Status: {res.status_code}")
        print(f"   • Extracted Material: {nlp_data['slots']['material']}")
        print(f"   • Extracted Technique: {nlp_data['slots']['craft_technique']}")
        print(f"   • Extracted Days: {nlp_data['slots']['production_days']}")
        print(f"   • Extracted Raw Cost: ₹{nlp_data['slots']['raw_material_cost']}")
        print(f"   • English Title: {nlp_data['title_en']}")
        print(f"   • Hindi Title: {nlp_data['title_hi']}")
        assert nlp_data["slots"]["production_days"] == 5
        assert nlp_data["slots"]["raw_material_cost"] == 1800.0

        # 5. Computer Vision Studio Background Removal & Calibration
        print("\n5. Testing Vision Studio Image Enhancement (/api/studio/enhance)...")
        test_img = Image.new("RGB", (400, 400), color=(180, 50, 40))
        img_buffer = BytesIO()
        test_img.save(img_buffer, format="JPEG")
        img_buffer.seek(0)

        files = {"file": ("test_craft.jpg", img_buffer, "image/jpeg")}
        res = client.post("/api/studio/enhance", files=files)
        studio_data = res.json()
        print(f"   Status: {res.status_code}")
        print(f"   • Raw Image URL: {studio_data['raw_image_url']}")
        print(f"   • Processed Studio URL: {studio_data['processed_image_url']}")
        print(f"   • Brightness Score: {studio_data['brightness_score']}")
        print(f"   • Contrast Score: {studio_data['contrast_score']}")
        print(f"   • Method: {studio_data['method_used']}")
        assert studio_data["success"] is True

        # 6. Catalog Products CRUD & ONDC Sync
        print("\n6. Testing Catalog Product Listing (/api/catalog/products)...")
        res = client.get("/api/catalog/products")
        products = res.json()
        print(f"   Status: {res.status_code} | Found {len(products)} products in catalog.")
        assert len(products) > 0
        first_prod = products[0]
        print(f"   - Product #{first_prod['id']}: {first_prod['title_en']}")
        print(f"     Price: ₹{first_prod['final_price']} | ONDC Synced: {first_prod['ondc_synced']}")

        # 7. ONDC Beckn Protocol Export
        print(f"\n7. Testing ONDC Beckn Protocol Export (/api/catalog/products/{first_prod['id']}/ondc-export)...")
        res = client.get(f"/api/catalog/products/{first_prod['id']}/ondc-export")
        beckn_export = res.json()
        print(f"   Status: {res.status_code}")
        print(f"   • Beckn Domain: {beckn_export['context']['domain']}")
        print(f"   • Country: {beckn_export['context']['country']}")
        beckn_item = beckn_export['message']['catalog']['bpp/providers'][0]['items'][0]
        print(f"   • Beckn Item ID: {beckn_item['id']}")
        print(f"   • Beckn Price: ₹{beckn_item['price']['value']} {beckn_item['price']['currency']}")
        print(f"   • Statutory Tags Count: {len(beckn_item['tags'])}")
        print(f"   • Schema.org Type: {beckn_export['schema_org']['@type']}")
        print(f"   • Schema.org Offers Price: ₹{beckn_export['schema_org']['offers']['price']}")
        assert beckn_export['context']['domain'] == "ONDC:RET10"

    # 8. Frontend Vite HTTP Test
    print("\n8. Testing Frontend Vite Server (http://localhost:5173/)...")
    with httpx.Client(timeout=10.0) as client:
        res = client.get("http://localhost:5173/")
        print(f"   Status: {res.status_code}")
        print(f"   Title Tag Present: {'KalaSetu' in res.text}")
        assert res.status_code == 200

    print("\n" + "=" * 60)
    print(" ALL END-TO-END TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)

if __name__ == "__main__":
    run_live_verification()
