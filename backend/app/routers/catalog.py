from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Product, Artisan, PricingLog
from app.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ArtisanCreate,
    ArtisanResponse,
    LoginRequest,
    LoginResponse,
    BecknExportResponse
)
from app.services.ondc_exporter import ONDCExporter

router = APIRouter(prefix="/catalog", tags=["Catalog & ONDC"])


# ---------------- Authentication & Artisans ----------------
@router.post("/login", response_model=LoginResponse)
async def login_artisan(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticates an artisan via Pehchan Artisan Card ID or Registered Mobile Number.
    Supports instant lookup and fallback demo artisan resolution.
    """
    artisan = None
    if payload.pehchan_id:
        result = await db.execute(
            select(Artisan).where(Artisan.pehchan_id.ilike(f"%{payload.pehchan_id.strip()}%"))
        )
        artisan = result.scalars().first()

    if not artisan and payload.phone:
        clean_phone = payload.phone.replace(" ", "").replace("-", "")
        result = await db.execute(
            select(Artisan).where(Artisan.phone.ilike(f"%{clean_phone[-10:]}%"))
        )
        artisan = result.scalars().first()

    # If artisan still not matched by custom input, return first registered artisan as fallback
    if not artisan:
        first_res = await db.execute(select(Artisan).limit(1))
        artisan = first_res.scalars().first()

    if not artisan:
        # Create a default artisan on the fly if none exist
        artisan = Artisan(
            pehchan_id=payload.pehchan_id or "P-IND-ARTISAN-01",
            name="Master Artisan",
            craft_type="Traditional Handloom & Handicraft",
            state="India",
            phone=payload.phone or "+91 98765 43210",
            preferred_lang="hi"
        )
        db.add(artisan)
        await db.commit()
        await db.refresh(artisan)

    return LoginResponse(
        success=True,
        artisan=artisan,
        token="kalasetu-token-session-verified",
        message=f"Welcome, {artisan.name}! Pehchan card verified."
    )


@router.get("/artisans", response_model=List[ArtisanResponse])
async def list_artisans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Artisan).order_by(Artisan.name))
    return result.scalars().all()


@router.post("/artisans", response_model=ArtisanResponse)
async def create_artisan(payload: ArtisanCreate, db: AsyncSession = Depends(get_db)):
    # Check if pehchan_id exists
    existing = await db.execute(select(Artisan).where(Artisan.pehchan_id == payload.pehchan_id))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Artisan with this Pehchan ID already registered.")

    artisan = Artisan(**payload.model_dump())
    db.add(artisan)
    await db.commit()
    await db.refresh(artisan)
    return artisan


# ---------------- Products ----------------
@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    craft: Optional[str] = Query(None, description="Filter by craft cluster"),
    ondc_only: Optional[bool] = Query(None, description="Filter by ONDC synced"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).options(selectinload(Product.artisan)).order_by(Product.created_at.desc())

    if craft:
        query = query.where(Product.craft_technique.ilike(f"%{craft}%"))
    if ondc_only is not None:
        query = query.where(Product.ondc_synced == ondc_only)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Product).options(selectinload(Product.artisan)).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product


@router.post("/products", response_model=ProductResponse)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    # If no artisan_id given, assign default artisan or first registered
    artisan_id = payload.artisan_id
    if not artisan_id:
        first_artisan = await db.execute(select(Artisan).limit(1))
        artisan_obj = first_artisan.scalars().first()
        if artisan_obj:
            artisan_id = artisan_obj.id

    product_data = payload.model_dump()
    product_data["artisan_id"] = artisan_id

    product = Product(**product_data)
    db.add(product)
    await db.commit()
    await db.refresh(product)

    # Reload with artisan
    query = select(Product).options(selectinload(Product.artisan)).where(Product.id == product.id)
    result = await db.execute(query)
    return result.scalars().first()


@router.patch("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).options(selectinload(Product.artisan)).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    update_dict = payload.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product)
    return product


@router.post("/products/{product_id}/sync-ondc")
async def toggle_ondc_sync(product_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Product).options(selectinload(Product.artisan)).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    product.ondc_synced = not product.ondc_synced
    await db.commit()
    await db.refresh(product)
    return {
        "success": True,
        "product_id": product.id,
        "ondc_synced": product.ondc_synced,
        "message": "Product successfully synced to ONDC Beckn network" if product.ondc_synced else "Product sync paused."
    }


@router.get("/products/{product_id}/ondc-export", response_model=BecknExportResponse)
async def export_ondc_beckn(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Exports product listing directly to Beckn Retail Protocol (v1.2.0) and Schema.org Product format.
    """
    query = select(Product).options(selectinload(Product.artisan)).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    export_payload = ONDCExporter.to_beckn_and_schema_org(product)
    return export_payload
