import pytest
import numpy as np
from app.services.ml_service import MLCraftIntelligenceService


def test_ml_service_dataset_loading_and_training():
    service = MLCraftIntelligenceService.get_instance()
    assert service.is_trained is True
    assert service.df is not None
    assert len(service.df) >= 600
    assert service.r2_metric > 0.85  # Random forest should achieve high fit on craft features
    assert service.mae_metric > 0.0


def test_ml_pricing_prediction_bounds():
    service = MLCraftIntelligenceService.get_instance()
    pred = service.predict_pricing(
        craft_cluster="Pochampally Ikat",
        state="Telangana",
        material="Pure Handloom Silk",
        production_days=5,
        raw_material_cost=2000.0,
        gi_tagged=1,
        festive_multiplier=1.20
    )

    assert "ml_predicted_price" in pred
    assert pred["ml_predicted_price"] >= pred["cost_floor"]
    assert pred["confidence_interval_95"][0] <= pred["ml_predicted_price"] <= pred["confidence_interval_95"][1]
    
    # Check feature importance components sum close to 100%
    importance = pred["feature_importance"]
    total_importance = sum(importance.values())
    assert 99.0 <= total_importance <= 101.0
    assert "Labor Days & State Wage Index" in importance


def test_seasonal_demand_forecaster():
    service = MLCraftIntelligenceService.get_instance()
    forecast = service.get_demand_forecast("Pochampally Ikat", "Telangana")
    
    assert forecast["craft_cluster"] == "Pochampally Ikat"
    assert len(forecast["monthly_forecast"]) == 12
    assert forecast["peak_month"] in ["Oct", "Nov", "Dec"]
    assert forecast["peak_surge"] >= 1.30
    assert "Strategic Production Alert" in forecast["strategic_advice"]


def test_kmeans_color_palette_extraction():
    service = MLCraftIntelligenceService.get_instance()
    # Create test image with distinct indigo and terracotta blocks
    test_img = np.zeros((100, 100, 3), dtype=np.uint8)
    test_img[:50, :] = [82, 58, 31]    # Indigo-like (BGR)
    test_img[50:, :] = [38, 50, 169]   # Terracotta-like (BGR)

    res = service.extract_color_palette_kmeans(test_img, k=3)
    assert "dominant_colors" in res
    assert len(res["dominant_colors"]) == 3
    assert res["natural_dye_match_score"] >= 60.0
    assert "authenticity_verdict" in res


def test_dataset_statistics():
    service = MLCraftIntelligenceService.get_instance()
    stats = service.get_dataset_statistics()
    
    assert stats["total_dataset_records"] >= 600
    assert stats["unique_clusters"] >= 8
    assert stats["gi_tag_price_premium_pct"] > 0.0
    assert len(stats["clusters"]) >= 8
