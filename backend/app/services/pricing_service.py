from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import CraftBenchmark
from app.schemas import PricingBreakdown, PricingCalculateResponse


# Official notified daily minimum wages for skilled artisan labor by state (FY 2024-25 baseline in INR)
STATE_SKILLED_WAGES: Dict[str, float] = {
    "Telangana": 680.0,
    "Karnataka": 650.0,
    "Bihar": 540.0,
    "Chhattisgarh": 560.0,
    "Gujarat": 610.0,
    "Uttar Pradesh": 580.0,
    "Rajasthan": 620.0,
    "Himachal Pradesh": 640.0,
    "Jammu & Kashmir": 750.0,
    "Assam": 510.0,
    "Odisha": 550.0,
    "West Bengal": 570.0,
    "Tamil Nadu": 660.0,
    "Maharashtra": 710.0,
    "Default": 600.0
}


class PricingService:
    @classmethod
    async def get_benchmark(
        cls,
        session: Optional[AsyncSession],
        craft_name: Optional[str] = None
    ) -> Optional[CraftBenchmark]:
        """Fetch craft cluster benchmark from database if available."""
        if not session or not craft_name:
            return None

        try:
            # Fuzzy match
            result = await session.execute(
                select(CraftBenchmark).where(CraftBenchmark.craft_name.ilike(f"%{craft_name}%"))
            )
            return result.scalars().first()
        except Exception:
            return None

    @classmethod
    def get_state_wage(cls, state: Optional[str]) -> float:
        """Returns notified daily skilled artisan wage for state or national skilled baseline."""
        if not state:
            return STATE_SKILLED_WAGES["Default"]
        return STATE_SKILLED_WAGES.get(state.strip(), STATE_SKILLED_WAGES["Default"])

    @classmethod
    async def calculate_pricing(
        cls,
        session: Optional[AsyncSession],
        craft_name: Optional[str] = "Handloom",
        state: Optional[str] = "Telangana",
        production_days: int = 1,
        raw_material_cost: float = 0.0
    ) -> PricingCalculateResponse:
        """
        Explainable, transparent cost-plus pricing engine anchored to state skilled wages:
        1. Hourly wage = Notified State Skilled Wage / 8 hrs
        2. Labor Cost = Days * 8 * Hourly Wage
        3. Cost Floor = Raw Materials + Labor Cost
        4. Fair Trade Price = Cost Floor * 1.25 (25% fair artisan livelihood margin)
        5. Market Ceiling = Benchmark Indexed ceiling or Cost Floor * 2.5
        """
        benchmark = await cls.get_benchmark(session, craft_name)

        if benchmark:
            daily_wage = benchmark.notified_daily_wage
            market_floor = benchmark.market_floor_price
            benchmark_ceiling = benchmark.market_ceiling_price
            gi_tagged = benchmark.gi_tagged
        else:
            daily_wage = cls.get_state_wage(state)
            market_floor = 0.0
            benchmark_ceiling = 0.0
            gi_tagged = False

        production_days = max(1, production_days)
        raw_material_cost = max(0.0, float(raw_material_cost))

        hourly_rate = round(daily_wage / 8.0, 2)
        total_hours = float(production_days * 8)
        labor_cost = round(production_days * daily_wage, 2)

        cost_floor = round(raw_material_cost + labor_cost, 2)
        margin_pct = 25.0
        fair_margin_amount = round(cost_floor * (margin_pct / 100.0), 2)
        fair_trade_price = round(cost_floor + fair_margin_amount, 2)

        # Market ceiling calculation
        if benchmark_ceiling > 0:
            market_ceiling = max(fair_trade_price * 1.35, benchmark_ceiling)
        else:
            market_ceiling = round(cost_floor * 2.4, 2)

        min_price = fair_trade_price
        optimal_price = round((fair_trade_price * 1.15), 2)
        max_price = market_ceiling

        breakdown = PricingBreakdown(
            notified_daily_wage=daily_wage,
            hourly_wage_rate=hourly_rate,
            total_labor_hours=total_hours,
            labor_cost=labor_cost,
            raw_material_cost=raw_material_cost,
            cost_floor=cost_floor,
            fair_trade_margin_pct=margin_pct,
            fair_trade_margin_amount=fair_margin_amount,
            fair_trade_price=fair_trade_price,
            market_benchmark_floor=market_floor,
            market_benchmark_ceiling=benchmark_ceiling,
            market_ceiling=market_ceiling
        )

        explanation_en = (
            f"Grounded Pricing Guarantee: For {production_days} day(s) of skilled labor in {state or 'State'}, "
            f"notified minimum skilled wage is ₹{daily_wage:.0f}/day (₹{hourly_rate:.2f}/hr), yielding a labor floor of ₹{labor_cost:,.2f}. "
            f"Adding certified raw materials of ₹{raw_material_cost:,.2f} gives an inviolable Cost Floor of ₹{cost_floor:,.2f}. "
            f"With a guaranteed 25% artisan livelihood margin (₹{fair_margin_amount:,.2f}), the Fair Trade Minimum is ₹{fair_trade_price:,.2f}. "
            f"Urban marketplace ceiling benchmarks this craft at up to ₹{market_ceiling:,.2f}."
        )

        explanation_hi = (
            f"उचित मूल्य की गारंटी: {state or 'राज्य'} के कुशल कारीगर न्यूनतम दैनिक वेतन ₹{daily_wage:.0f}/दिन के अनुसार, "
            f"{production_days} दिन के श्रम का मेहनताना ₹{labor_cost:,.2f} बनता है। "
            f"कच्ची सामग्री ₹{raw_material_cost:,.2f} जोड़ने पर न्यूनतम लागत ₹{cost_floor:,.2f} आती है। "
            f"25% का शुद्ध कारीगर मुनाफा (₹{fair_margin_amount:,.2f}) जोड़ने पर उचित बिक्री मूल्य ₹{fair_trade_price:,.2f} तय होता है।"
        )

        return PricingCalculateResponse(
            success=True,
            cost_floor=cost_floor,
            fair_trade_price=fair_trade_price,
            market_ceiling=market_ceiling,
            recommended_range=[min_price, optimal_price, max_price],
            breakdown=breakdown,
            explanation_en=explanation_en,
            explanation_hi=explanation_hi,
            gi_tagged=gi_tagged
        )
