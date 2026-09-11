import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000"

results = []

def test_endpoint(name, method, path, payload=None):
    url = f"{BASE_URL}{path}"
    try:
        data = None
        headers = {}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            body = response.read().decode("utf-8")
            results.append({"name": name, "method": method, "path": path, "status": status, "error": None})
            print(f"[{status}] {method} {path} - {name}")
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        results.append({"name": name, "method": method, "path": path, "status": e.code, "error": err})
        print(f"[{e.code}] {method} {path} - {name}: {err}")
    except Exception as e:
        results.append({"name": name, "method": method, "path": path, "status": "EXCEPTION", "error": str(e)})
        print(f"[FAIL] {method} {path} - {name}: {e}")

print("Testing all backend endpoints...")
test_endpoint("Root API", "GET", "/")
test_endpoint("Health Check", "GET", "/api/health")
test_endpoint("Pricing Benchmarks", "GET", "/api/pricing/benchmarks")
test_endpoint("Pricing State Wages", "GET", "/api/pricing/state-wages")
test_endpoint("Pricing Calculate", "POST", "/api/pricing/calculate", {
    "craft_name": "Pochampally Ikat",
    "state": "Telangana",
    "production_days": 5,
    "raw_material_cost": 1500.0,
    "gi_tagged": True,
    "season_multiplier": 1.1
})
test_endpoint("Catalog Products", "GET", "/api/catalog/products")
test_endpoint("Catalog Artisans", "GET", "/api/catalog/artisans")
test_endpoint("Catalog Login Phone", "POST", "/api/catalog/login", {
    "phone": "+91 98480 12345"
})
test_endpoint("Catalog Login Pehchan", "POST", "/api/catalog/login", {
    "pehchan_id": "P-TEL-WEAV-0924"
})
test_endpoint("ML Dataset Stats", "GET", "/api/ml/dataset-stats")
test_endpoint("ML Demand Forecast", "GET", "/api/ml/demand-forecast?craft=Pochampally+Ikat&state=Telangana")
test_endpoint("ML Pricing Prediction", "POST", "/api/ml/predict-pricing", {
    "craft_cluster": "Pochampally Ikat",
    "state": "Telangana",
    "material": "Pure Handloom Silk",
    "production_days": 5,
    "raw_material_cost": 1800.0,
    "gi_tagged": 1,
    "festive_multiplier": 1.1
})
test_endpoint("Speech Slot Extraction", "POST", "/api/speech/extract-slots", {
    "transcript": "यह पोचमपल्ली रेशम साड़ी है पांच दिन लगे शुद्ध सिल्क",
    "language": "hi"
})
test_endpoint("ONDC Export Product 1", "GET", "/api/catalog/products/1/ondc-export")

# Test multipart/form-data for palette analysis
import urllib.parse
palette_data = urllib.parse.urlencode({"image_path": "/uploads/processed/sample_ikat_studio.jpg", "k": 4}).encode("utf-8")
palette_req = urllib.request.Request(
    f"{BASE_URL}/api/ml/analyze-palette",
    data=palette_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    method="POST"
)
try:
    with urllib.request.urlopen(palette_req, timeout=5) as resp:
        results.append({"name": "ML Analyze Palette", "method": "POST", "path": "/api/ml/analyze-palette", "status": resp.getcode(), "error": None})
        print(f"[{resp.getcode()}] POST /api/ml/analyze-palette - ML Analyze Palette")
except urllib.error.HTTPError as e:
    results.append({"name": "ML Analyze Palette", "method": "POST", "path": "/api/ml/analyze-palette", "status": e.code, "error": e.read().decode()})
    print(f"[{e.code}] POST /api/ml/analyze-palette: {e.read().decode()}")

print("\nSummary:")
failures = [r for r in results if r["status"] not in [200, 201]]
print(f"Total tested: {len(results)}, Failures: {len(failures)}")
if failures:
    print("Failures:")
    for f in failures:
        print(f, json.dumps(f))
else:
    print("ALL TESTED ENDPOINTS PASSED (200 OK)!")
