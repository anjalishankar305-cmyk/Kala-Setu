from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ---------------- Artisan Schemas ----------------
class ArtisanBase(BaseModel):
    pehchan_id: str = Field(..., description="Pehchan Artisan ID (Ministry of Textiles/MoSJE)")
    name: str = Field(..., description="Artisan Full Name")
    craft_type: str = Field(..., description="Craft Cluster / Specialization")
    state: str = Field(..., description="State of origin")
    phone: Optional[str] = None
    preferred_lang: str = Field(default="hi", description="Preferred language code ('hi' or 'en')")


class ArtisanCreate(ArtisanBase):
    pass


class ArtisanResponse(ArtisanBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    pehchan_id: Optional[str] = None
    phone: Optional[str] = None
    otp: Optional[str] = "1234"


class LoginResponse(BaseModel):
    success: bool = True
    artisan: ArtisanResponse
    token: str = "kalasetu-session-token-v1"
    message: str = "Login successful"


# ---------------- Vision Studio Schemas ----------------
class AICraftAnalysis(BaseModel):
    craft_cluster: str
    state: str
    category: str
    material: str
    confidence_score: float
    estimated_production_days: int
    estimated_raw_material_cost: float
    predicted_fair_price: float
    cost_floor: float
    price_elasticity: str
    visual_signatures: List[str] = Field(default_factory=list)
    dominant_colors: List[str] = Field(default_factory=list)


class VisionEnhanceResponse(BaseModel):
    success: bool = True
    raw_image_url: str
    processed_image_url: str
    brightness_score: float
    contrast_score: float
    method_used: str
    message: str
    ai_craft_analysis: Optional[AICraftAnalysis] = None


# ---------------- Speech & NLP Schemas ----------------
class SpeechExtractRequest(BaseModel):
    transcript: Optional[str] = None
    audio_base64: Optional[str] = None
    preferred_lang: Optional[str] = "hi"


class ExtractedSlots(BaseModel):
    material: str
    craft_technique: str
    production_days: int
    raw_material_cost: float
    state: Optional[str] = None
    confidence_score: float = 0.95


class SpeechExtractResponse(BaseModel):
    success: bool = True
    transcript_raw: str
    slots: ExtractedSlots
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    suggested_tags: List[str]


# ---------------- Grounded Pricing Schemas ----------------
class PricingCalculateRequest(BaseModel):
    craft_name: Optional[str] = "Handloom"
    state: Optional[str] = "Telangana"
    production_days: int = Field(ge=1, default=1)
    raw_material_cost: float = Field(ge=0.0, default=0.0)


class PricingBreakdown(BaseModel):
    notified_daily_wage: float
    hourly_wage_rate: float
    total_labor_hours: float
    labor_cost: float
    raw_material_cost: float
    cost_floor: float
    fair_trade_margin_pct: float
    fair_trade_margin_amount: float
    fair_trade_price: float
    market_benchmark_floor: float
    market_benchmark_ceiling: float
    market_ceiling: float


class PricingCalculateResponse(BaseModel):
    success: bool = True
    cost_floor: float
    fair_trade_price: float
    market_ceiling: float
    recommended_range: List[float]  # [min_price, optimal_price, max_price]
    breakdown: PricingBreakdown
    explanation_en: str
    explanation_hi: str
    gi_tagged: bool = False


# ---------------- Product Catalog Schemas ----------------
class ProductCreate(BaseModel):
    artisan_id: Optional[int] = None
    raw_image_path: Optional[str] = None
    processed_image_path: Optional[str] = None
    audio_url: Optional[str] = None
    transcript_raw: Optional[str] = None

    title_en: str
    title_hi: str
    description_en: str
    description_hi: str

    material: str
    craft_technique: str
    production_days: int = 1

    raw_material_cost: float = 0.0
    labor_cost: float = 0.0
    suggested_price: float = 0.0
    final_price: float = 0.0
    ondc_synced: bool = False


class ProductUpdate(BaseModel):
    final_price: Optional[float] = None
    ondc_synced: Optional[bool] = None
    title_en: Optional[str] = None
    title_hi: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    artisan_id: Optional[int] = None
    artisan: Optional[ArtisanResponse] = None
    raw_image_path: Optional[str] = None
    processed_image_path: Optional[str] = None
    audio_url: Optional[str] = None
    transcript_raw: Optional[str] = None

    title_en: str
    title_hi: str
    description_en: str
    description_hi: str

    material: str
    craft_technique: str
    production_days: int

    raw_material_cost: float
    labor_cost: float
    suggested_price: float
    final_price: float
    ondc_synced: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Craft Benchmark Schemas ----------------
class CraftBenchmarkResponse(BaseModel):
    id: int
    craft_name: str
    base_material: str
    state: str
    notified_daily_wage: float
    typical_days_range_min: int
    typical_days_range_max: int
    market_floor_price: float
    market_ceiling_price: float
    gi_tagged: bool

    model_config = ConfigDict(from_attributes=True)


# ---------------- ONDC Beckn & Schema.org Export Schemas ----------------
class BecknExportResponse(BaseModel):
    context: Dict[str, Any]
    message: Dict[str, Any]
    schema_org: Dict[str, Any]
