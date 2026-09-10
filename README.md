# KalaSetu (कलासेतु)
### AI-Driven Market Linkage & Smart Cataloging for Marginalized Artisans
**An Initiative for the Ministry of Social Justice and Empowerment (MoSJE)**

---

## 🌟 Executive Summary & Evaluation Pitch (MoSJE Judges)

India is home to over 7 million traditional artisans and handloom weavers, predominantly from marginalized, rural, and tribal communities (SC, ST, OBC, and women craftspeople). Despite unmatched heritage skills, they suffer from deep economic isolation, exploitative middleman markups, and low digital literacy.

**KalaSetu (Bridge of Art)** is a purpose-built, accessible, AI-powered cataloging and market linkage platform that dissolves barriers between rural workshops and India's open digital commerce infrastructure (ONDC):

1. **Zero-Text, Audio-First Interaction**: Artisans don't need to read or type complex English e-commerce schemas. A single high-contrast microphone button captures their spoken words in Hindi or regional dialects.
2. **Grounded Indic Speech & NLP**: Extracts key production variables (Material, Craft Technique, Days Invested, Raw Material Cost) and generates bilingual (English + Hindi) SEO product schemas without synthetic fabric hallucinations.
3. **Automated Vision Studio**: Calibrates ambient lighting to preserve handloom dye fidelity and isolates cluttered workshop backgrounds into pristine studio white (#FAFAFA) e-commerce ready assets.
4. **Transparent Cost-Plus Fair Wage Engine**: Replaces predatory bidding and black-box algorithms with an inviolable **Cost Floor** anchored in official state skilled minimum wages ($W_{\text{state}} \times \text{Days}$) + certified raw material cost + guaranteed 25% artisan livelihood margin.
5. **Direct ONDC Beckn Protocol & Schema.org Export**: Generates compliant Beckn Retail Protocol (v1.2.0) JSON-LD and Schema.org records with statutory Indian retail tags (Country of Origin, Pehchan ID, and GI verification).

---

## 🏛️ System Architecture

```
                                  +-------------------------------------------------------+
                                  |       KalaSetu React 18 + Tailwind Frontend           |
                                  | (Mobile Emulation, Web Audio API, Camera Viewfinder)  |
                                  +-------------------------------------------------------+
                                                              |
                                               REST APIs (HTTP / JSON / Multipart)
                                                              v
+-------------------------------------------------------------------------------------------------------------------------+
|                                              FastAPI Backend (Python 3.13)                                               |
+------------------------------+-----------------------------+-----------------------------+------------------------------+
|     /api/studio/enhance      |    /api/speech/transcribe   |    /api/pricing/calculate   |    /api/catalog/products     |
|   (Computer Vision Studio)   |     (Indic Voice & NLP)     |   (Grounded Fair Pricing)   |      (Catalog & ONDC)        |
+------------------------------+-----------------------------+-----------------------------+------------------------------+
| • rembg background removal   | • Indic slot-filling engine | • State skilled wage tables | • Beckn Retail JSON-LD       |
| • OpenCV lighting & contrast | • Days & Cost extraction    | • Cost floor calculation    | • Schema.org Product markup  |
| • Handloom dye preservation  | • Bilingual Hindi/EN SEO    | • Benchmark market ceilings | • Pehchan ID GI verification |
+------------------------------+-----------------------------+-----------------------------+------------------------------+
                                                              |
                                             SQLAlchemy 2.0 (aiosqlite)
                                                              v
                                          +---------------------------------------+
                                          |            SQLite Database            |
                                          | (Artisan, Product, CraftBenchmark)    |
                                          +---------------------------------------+
```

---

## 📁 Project File Structure

```
kalasetu-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI entry point, CORS & static mount
│   │   ├── config.py                   # Pydantic BaseSettings & directory management
│   │   ├── database.py                 # Async SQLite SQLAlchemy session provider
│   │   ├── models.py                   # ORM: Artisan, Product, CraftBenchmark, PricingLog
│   │   ├── schemas.py                  # Pydantic v2 schemas for all payloads
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── catalog.py              # Catalog creation, listing, and ONDC export
│   │   │   ├── studio.py               # Photo upload & background segmentation
│   │   │   ├── speech.py               # Audio ingest, Web Speech STT, slot-filler
│   │   │   └── pricing.py              # Fair wage engine & benchmark lookups
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── vision_service.py       # rembg + OpenCV lighting calibration
│   │       ├── nlp_service.py          # Indic voice slot-filler (English/Hindi)
│   │       ├── pricing_service.py      # State wage floor + fair trade margin logic
│   │       └── ondc_exporter.py        # Beckn Retail Protocol & Schema.org exporter
│   ├── scripts/
│   │   ├── seed_craft_data.py          # Seeds 10 craft clusters & sample artisans
│   │   └── generate_sample_assets.py   # Generates sample craft imagery
│   ├── tests/
│   │   ├── test_pricing.py             # Pricing formula & minimum wage tests
│   │   └── test_catalog.py             # Catalog & Beckn schema validation tests
│   ├── pytest.ini
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioRecorder.jsx       # Large high-contrast tap-to-talk mic button
│   │   │   ├── CameraStudio.jsx        # Viewfinder with framing alignment guides
│   │   │   ├── PricingGauge.jsx        # Visual breakdown (Raw + Labor + Margin)
│   │   │   └── ProductCard.jsx         # Accessible bilingual card with audio readout
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx           # Pehchan card ID, mobile OTP & one-tap artisan login
│   │   │   ├── WizardPage.jsx          # 3-step audio-guided creation wizard
│   │   │   └── CatalogDashboard.jsx    # Visual inventory grid with ONDC sync
│   │   ├── services/
│   │   │   └── api.js                  # Axios client connecting to FastAPI
│   │   ├── App.jsx                     # Viewport emulation & language switcher
│   │   ├── index.css                   # Tailwind styles & accessible keyframes
│   │   └── main.jsx                    # React 18 DOM root
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Python**: 3.11 or higher (Python 3.13 recommended)
- **Node.js**: v18 or higher (v24 LTS installed)

### 2. Backend Setup
In a terminal, navigate to the `backend/` directory:
```powershell
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database seeder
python scripts/seed_craft_data.py

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### 3. Frontend Setup
In a separate terminal, navigate to `frontend/`:
```powershell
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
- Application Web App: `http://localhost:5173`

---

## 🧪 Automated Testing

Execute the test suite verifying mathematical integrity of pricing formulas, state minimum wage index lookups, and Beckn JSON-LD compliance:
```powershell
cd backend
python -m pytest tests/ -v
```

Output:
```
backend\tests\test_catalog.py::test_api_health PASSED
backend\tests\test_catalog.py::test_ondc_exporter_schema_structure PASSED
backend\tests\test_catalog.py::test_speech_slot_extraction PASSED
backend\tests\test_pricing.py::test_state_skilled_wages_defaults PASSED
backend\tests\test_pricing.py::test_pricing_calculation_formula PASSED
backend\tests\test_pricing.py::test_zero_raw_cost_edge_case PASSED
6 passed in 1.22s
```

---

## 📊 Grounded Pricing Formulation

KalaSetu completely eliminates arbitrary or predatory pricing algorithms:

$$\text{Hourly Wage Rate} = \frac{\text{Notified State Skilled Daily Wage}}{8}$$

$$\text{Labor Cost Floor} = \text{Production Days} \times 8 \times \text{Hourly Wage Rate}$$

$$\text{Cost Floor} = \text{Raw Material Cost} + \text{Labor Cost Floor}$$

$$\text{Fair Trade Benchmark Price} = \text{Cost Floor} \times 1.25 \quad (25\%\text{ Artisan Margin})$$

$$\text{Market Ceiling} = \max(\text{Benchmark Ceiling}, \text{Cost Floor} \times 2.5)$$

### Pre-Seeded Indian Craft Clusters (Sample Wage Benchmarks)
| Craft Cluster | State | Notified Wage (INR/day) | Typical Days | Benchmark Floor | Benchmark Ceiling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pochampally Ikat** | Telangana | ₹680 | 3 - 8 days | ₹3,800 | ₹9,500 |
| **Madhubani Painting** | Bihar | ₹540 | 2 - 6 days | ₹1,800 | ₹5,500 |
| **Dhokra Bell Metal** | Chhattisgarh | ₹560 | 4 - 10 days | ₹2,800 | ₹8,500 |
| **Channapatna Toys** | Karnataka | ₹650 | 1 - 3 days | ₹950 | ₹2,800 |
| **Kutch Ajrakh Print** | Gujarat | ₹610 | 3 - 7 days | ₹2,200 | ₹6,000 |
| **Banarasi Brocade** | Uttar Pradesh | ₹580 | 5 - 15 days | ₹6,500 | ₹22,000 |
| **Blue Pottery** | Rajasthan | ₹620 | 2 - 5 days | ₹1,400 | ₹4,200 |
| **Kullu Shawls** | Himachal Pradesh | ₹640 | 3 - 7 days | ₹3,200 | ₹8,900 |

---

## 🌐 ONDC Beckn Protocol & Schema.org Export

Every product listed on KalaSetu is exportable into:
1. **Beckn Retail Protocol (v1.2.0)**:
   - `context`: `domain: ONDC:RET10`, `action: on_search`, `country: IND`
   - `bpp/descriptor`: KalaSetu MoSJE node
   - `items`: Price breakdowns, tags for `statutory_reqs_packaged_commodities` (Manufacturer, Country of Origin, Pehchan ID), `artisan_verification` (GI compliance, Handloom mark, Fair Wage guarantee).
2. **Schema.org / Product**:
   - Valid JSON-LD structured data for Google & search engine crawling with `@type: Product`, `offers`, `brand`, and `material`.

---

## 🎯 Key Innovation Highlights for MoSJE Judges

1. **Accessibility First**: Designed with 48px minimum touch targets, high-contrast visual cues, and audio read-aloud buttons on every screen for low-literacy artisans.
2. **Mobile Viewport Emulation**: Built-in toggle in the header allows evaluators to simulate the authentic smartphone experience used by rural artisans or view the widescreen desktop dashboard.
3. **Instant One-Tap Demo Modes**: Includes pre-recorded Indic voice samples and authentic craft photos so judges can evaluate the entire AI workflow in seconds without requiring camera or microphone hardware permissions.
4. **Economic Justice Safeguard**: If an artisan accidentally slides their price below the statutory minimum wage cost floor, the system highlights the shortfall and ensures their livelihood is protected.
