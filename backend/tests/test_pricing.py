import pytest
from app.services.pricing_service import PricingService, STATE_SKILLED_WAGES


def test_state_skilled_wages_defaults():
    assert "Telangana" in STATE_SKILLED_WAGES
    assert STATE_SKILLED_WAGES["Telangana"] == 680.0
    assert STATE_SKILLED_WAGES["Bihar"] == 540.0
    assert PricingService.get_state_wage("UnknownState") == 600.0


@pytest.mark.asyncio
async def test_pricing_calculation_formula():
    # Telangana wage = 680 INR/day, 4 days, raw material = 1500 INR
    res = await PricingService.calculate_pricing(
        session=None,
        craft_name="Custom Handloom",
        state="Telangana",
        production_days=4,
        raw_material_cost=1500.0
    )

    assert res.success is True
    assert res.breakdown.notified_daily_wage == 680.0
    assert res.breakdown.hourly_wage_rate == round(680.0 / 8.0, 2)
    assert res.breakdown.labor_cost == 4 * 680.0  # 2720.0
    assert res.breakdown.raw_material_cost == 1500.0
    assert res.cost_floor == 1500.0 + 2720.0  # 4220.0
    assert res.fair_trade_price == round(4220.0 * 1.25, 2)  # 5275.0
    assert res.market_ceiling >= res.fair_trade_price
    assert len(res.recommended_range) == 3
    assert res.recommended_range[0] == res.fair_trade_price
    assert "Telangana" in res.explanation_en
    assert "25%" in res.explanation_en


@pytest.mark.asyncio
async def test_zero_raw_cost_edge_case():
    res = await PricingService.calculate_pricing(
        session=None,
        craft_name="Clay Pottery",
        state="Bihar",
        production_days=1,
        raw_material_cost=0.0
    )
    assert res.cost_floor == 540.0
    assert res.fair_trade_price == 540.0 * 1.25
    assert res.breakdown.fair_trade_margin_pct == 25.0
