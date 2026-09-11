import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import urllib.request
import urllib.parse
import json
import io
from PIL import Image

BASE_URL = "http://127.0.0.1:8000"

def post_json(path, data):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.getcode(), json.loads(r.read().decode("utf-8"))

def get_json(path):
    req = urllib.request.Request(f"{BASE_URL}{path}", method="GET")
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.getcode(), json.loads(r.read().decode("utf-8"))

print("=== RUNNING COMPLETE KALASITU BACKEND VERIFICATION ===")

# 1. Health
code, res = get_json("/api/health")
assert code == 200 and res["status"] == "healthy"
print("[PASS] 1. Health check")

# 2. Benchmarks
code, res = get_json("/api/pricing/benchmarks")
assert code == 200 and len(res) >= 10
print(f"[PASS] 2. Verified {len(res)} craft benchmarks")

# 3. State Wages
code, res = get_json("/api/pricing/state-wages")
assert code == 200 and "Telangana" in res and "Jammu & Kashmir" in res
print(f"[PASS] 3. Verified state wage rates (including J&K: ₹{res['Jammu & Kashmir']})")

# 4. Pricing Calculation
code, res = post_json("/api/pricing/calculate", {
    "craft_name": "Pochampally Ikat",
    "state": "Telangana",
    "production_days": 5,
    "raw_material_cost": 1500.0,
    "gi_tagged": True,
    "season_multiplier": 1.1
})
assert code == 200 and res["cost_floor"] > 0 and res["fair_trade_price"] >= res["cost_floor"]
print(f"[PASS] 4. Pricing calculation: Cost Floor = ₹{res['cost_floor']}, Fair Price = ₹{res['fair_trade_price']}")

# 5. Catalog Products
code, res = get_json("/api/catalog/products")
assert code == 200 and len(res) >= 3
print(f"[PASS] 5. Catalog products loaded: {len(res)} items")

# 6. Catalog Login (Pehchan ID)
code, res = post_json("/api/catalog/login", {"pehchan_id": "P-TEL-WEAV-0924"})
assert code == 200 and res["success"] is True and "Narsimha" in res["artisan"]["name"]
print(f"[PASS] 6. Artisan login verified for Pehchan ID: {res['artisan']['pehchan_id']}")

# 7. Speech Slot Extraction
code, res = post_json("/api/speech/extract-slots", {
    "transcript": "यह पोचमपल्ली इकत साड़ी सिल्क से बनी है इसमें 5 दिन लगे और 1800 रुपये कच्चा माल लगा",
    "preferred_lang": "hi"
})
assert code == 200 and res["slots"]["production_days"] == 5 and res["slots"]["raw_material_cost"] == 1800.0
print(f"[PASS] 7. Indic Speech Extraction: Days={res['slots']['production_days']}, Cost=₹{res['slots']['raw_material_cost']}")

# 8. ML Pricing Regressor
code, res = post_json("/api/ml/predict-pricing", {
    "craft_cluster": "Pochampally Ikat",
    "state": "Telangana",
    "material": "Pure Handloom Silk",
    "production_days": 5,
    "raw_material_cost": 1800.0,
    "gi_tagged": 1,
    "festive_multiplier": 1.15
})
assert code == 200 and res["status"] == "success"
print(f"[PASS] 8. Valuation Engine: Predicted Value = ₹{res['data']['ml_predicted_price']}, R2 Metric = {res['data']['model_r2']}")

# 9. ONDC Beckn Export
code, res = get_json("/api/catalog/products/1/ondc-export")
assert code == 200 and res["context"]["domain"] == "ONDC:RET10"
assert res["schema_org"]["@type"] == "Product"
print("[PASS] 9. ONDC Beckn Protocol & Schema.org JSON-LD exported and verified")

# 10. Studio Image Enhancement
# Create multipart form data for file upload
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
img_buf = io.BytesIO()
Image.new("RGB", (100, 100), color=(180, 50, 40)).save(img_buf, format="JPEG")
img_bytes = img_buf.getvalue()

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="sample.jpg"\r\n'
    f"Content-Type: image/jpeg\r\n\r\n"
).encode("utf-8") + img_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

req = urllib.request.Request(
    f"{BASE_URL}/api/studio/enhance",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST"
)
with urllib.request.urlopen(req, timeout=10) as r:
    studio_res = json.loads(r.read().decode("utf-8"))
    assert r.getcode() == 200 and studio_res["success"] is True
    print(f"[PASS] 10. Studio Image Calibration: Method={studio_res['method_used']}, Brightness={studio_res['brightness_score']}")

print("\n🎉 ALL 10 CORE BACKEND SYSTEMS VERIFIED WITH 100% SUCCESS!")
