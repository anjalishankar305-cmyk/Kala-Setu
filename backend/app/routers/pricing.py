from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import CraftBenchmark
from app.schemas import (
    PricingCalculateRequest,
    PricingCalculateResponse,
    CraftBenchmarkResponse
)
from app.services.pricing_service import PricingService, STATE_SKILLED_WAGES

router = APIRouter(prefix="/pricing", tags=["Grounded Pricing Engine"])


@router.post("/calculate", response_model=PricingCalculateResponse)
async def calculate_fair_pricing(
    payload: PricingCalculateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Computes explainable, transparent cost-plus pricing anchored to state minimum wages
    and market benchmark datasets.
    """
    response = await PricingService.calculate_pricing(
        session=db,
        craft_name=payload.craft_name,
        state=payload.state,
        production_days=payload.production_days,
        raw_material_cost=payload.raw_material_cost
    )
    return response


@router.get("/benchmarks", response_model=List[CraftBenchmarkResponse])
async def list_craft_benchmarks(db: AsyncSession = Depends(get_db)):
    """
    Returns verified craft cluster benchmarks (notified minimum wages, standard labor days, price floors/ceilings).
    """
    result = await db.execute(select(CraftBenchmark).order_by(CraftBenchmark.craft_name))
    benchmarks = result.scalars().all()
    return benchmarks


@router.get("/state-wages")
async def get_state_wage_rates() -> Dict[str, float]:
    """
    Returns notified daily skilled artisan wage rates across Indian states (INR/day).
    """
    return STATE_SKILLED_WAGES
