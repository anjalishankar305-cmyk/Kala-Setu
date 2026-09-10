import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Artisan(Base):
    __tablename__ = "artisans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pehchan_id = Column(String(64), unique=True, index=True, nullable=False)  # Ministry Artisan ID card
    name = Column(String(128), nullable=False)
    craft_type = Column(String(128), nullable=False)
    state = Column(String(64), nullable=False)
    phone = Column(String(32), nullable=True)
    preferred_lang = Column(String(16), default="hi")  # 'hi' or 'en'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="artisan", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    artisan_id = Column(Integer, ForeignKey("artisans.id"), nullable=True)
    
    # Asset media paths
    raw_image_path = Column(String(255), nullable=True)
    processed_image_path = Column(String(255), nullable=True)
    audio_url = Column(String(255), nullable=True)
    transcript_raw = Column(Text, nullable=True)

    # Bilingual product metadata
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=False)
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=False)

    # Craft attributes
    material = Column(String(128), nullable=False)
    craft_technique = Column(String(128), nullable=False)
    production_days = Column(Integer, default=1)

    # Pricing attributes (Grounded cost-plus economics)
    raw_material_cost = Column(Float, default=0.0)
    labor_cost = Column(Float, default=0.0)
    suggested_price = Column(Float, default=0.0)
    final_price = Column(Float, default=0.0)

    # ONDC compliance
    ondc_synced = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    artisan = relationship("Artisan", back_populates="products")
    pricing_logs = relationship("PricingLog", back_populates="product", cascade="all, delete-orphan")


class CraftBenchmark(Base):
    __tablename__ = "craft_benchmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    craft_name = Column(String(128), unique=True, index=True, nullable=False)
    base_material = Column(String(128), nullable=False)
    state = Column(String(64), nullable=False)
    notified_daily_wage = Column(Float, nullable=False)  # State notified skilled wage (INR)
    typical_days_range_min = Column(Integer, default=1)
    typical_days_range_max = Column(Integer, default=10)
    market_floor_price = Column(Float, nullable=False)
    market_ceiling_price = Column(Float, nullable=False)
    gi_tagged = Column(Boolean, default=True)


class PricingLog(Base):
    __tablename__ = "pricing_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    raw_material_cost = Column(Float, nullable=False)
    labor_cost = Column(Float, nullable=False)
    daily_wage_rate = Column(Float, nullable=False)
    cost_floor = Column(Float, nullable=False)
    fair_trade_price = Column(Float, nullable=False)
    market_ceiling = Column(Float, nullable=False)
    selected_price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="pricing_logs")
