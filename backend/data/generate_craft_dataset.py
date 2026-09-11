import csv
import random
from pathlib import Path

# Fix random seed for reproducible, high-quality data science dataset
random.seed(42)

CRAFT_CLUSTERS = [
    {
        "cluster": "Pochampally Ikat",
        "state": "Telangana",
        "category": "Textiles",
        "material": "Pure Handloom Silk",
        "min_days": 3, "max_days": 10,
        "min_raw": 1200, "max_raw": 3800,
        "gi_tagged": 1,
        "dye_types": ["Natural Indigo/Madder", "Vegetable Dye Blend"],
        "base_daily_wage": 680.0,
        "festive_peaks": ["Diwali", "Wedding Season"],
        "base_rating": 4.8
    },
    {
        "cluster": "Banarasi Brocade",
        "state": "Uttar Pradesh",
        "category": "Textiles",
        "material": "Mulberry Silk & Zari",
        "min_days": 5, "max_days": 16,
        "min_raw": 2200, "max_raw": 6500,
        "gi_tagged": 1,
        "dye_types": ["Metallic Zari & Organic Dip", "Vegetable Dye Blend"],
        "base_daily_wage": 620.0,
        "festive_peaks": ["Wedding Season", "Durga Puja"],
        "base_rating": 4.9
    },
    {
        "cluster": "Mithila Madhubani",
        "state": "Bihar",
        "category": "Folk Painting",
        "material": "Handmade Recycled Paper & Canvas",
        "min_days": 2, "max_days": 7,
        "min_raw": 300, "max_raw": 1200,
        "gi_tagged": 1,
        "dye_types": ["Natural Plant Extracts (Haldi/Neel)", "Organic Mineral Pigments"],
        "base_daily_wage": 520.0,
        "festive_peaks": ["Chhath Puja", "Diwali"],
        "base_rating": 4.7
    },
    {
        "cluster": "Dhokra Metal Casting",
        "state": "Chhattisgarh",
        "category": "Metalwork",
        "material": "Lost-Wax Brass & Bell Metal",
        "min_days": 4, "max_days": 12,
        "min_raw": 900, "max_raw": 2800,
        "gi_tagged": 1,
        "dye_types": ["Natural Beeswax Patina", "Oxidized Brass Finish"],
        "base_daily_wage": 540.0,
        "festive_peaks": ["Dussehra", "Diwali"],
        "base_rating": 4.6
    },
    {
        "cluster": "Channapatna Lacquerware",
        "state": "Karnataka",
        "category": "Woodcraft",
        "material": "Seasoned Hale Wood & Vegetable Lac",
        "min_days": 1, "max_days": 5,
        "min_raw": 250, "max_raw": 950,
        "gi_tagged": 1,
        "dye_types": ["Organic Turmeric & Indigo Lacquer", "Natural Vegetable Resins"],
        "base_daily_wage": 650.0,
        "festive_peaks": ["Ganesh Chaturthi", "Childrens Day"],
        "base_rating": 4.8
    },
    {
        "cluster": "Ajrakh Handblock Print",
        "state": "Gujarat",
        "category": "Textiles",
        "material": "Organic Modal Cotton",
        "min_days": 3, "max_days": 8,
        "min_raw": 600, "max_raw": 2100,
        "gi_tagged": 1,
        "dye_types": ["16-Stage Natural Indigo & Madder", "Pomegranate Rind Extract"],
        "base_daily_wage": 600.0,
        "festive_peaks": ["Navratri", "Diwali"],
        "base_rating": 4.7
    },
    {
        "cluster": "Jaipur Blue Pottery",
        "state": "Rajasthan",
        "category": "Pottery",
        "material": "Quartz Powder, Fuller's Earth & Glass",
        "min_days": 2, "max_days": 6,
        "min_raw": 450, "max_raw": 1600,
        "gi_tagged": 1,
        "dye_types": ["Cobalt Oxide Blue Glaze", "Copper Oxide Green Glaze"],
        "base_daily_wage": 580.0,
        "festive_peaks": ["Teej", "Diwali"],
        "base_rating": 4.6
    },
    {
        "cluster": "Kullu Geometric Shawls",
        "state": "Himachal Pradesh",
        "category": "Textiles",
        "material": "Indigenous Himalayan Sheep Wool",
        "min_days": 3, "max_days": 9,
        "min_raw": 800, "max_raw": 2600,
        "gi_tagged": 1,
        "dye_types": ["Natural Unbleached Wool Hues", "Vegetable Dye Borders"],
        "base_daily_wage": 560.0,
        "festive_peaks": ["Winter Season", "Republic Day"],
        "base_rating": 4.8
    },
    {
        "cluster": "Bastar Wrought Iron",
        "state": "Chhattisgarh",
        "category": "Metalwork",
        "material": "Hand-Forged Recycled Iron",
        "min_days": 2, "max_days": 7,
        "min_raw": 400, "max_raw": 1500,
        "gi_tagged": 1,
        "dye_types": ["Charcoal Forge Oxidation", "Black Oxide Patina"],
        "base_daily_wage": 540.0,
        "festive_peaks": ["Bastar Dussehra", "Diwali"],
        "base_rating": 4.6
    },
    {
        "cluster": "Kashmiri Pashmina",
        "state": "Jammu & Kashmir",
        "category": "Textiles",
        "material": "Grade-A Changthangi Cashmere",
        "min_days": 7, "max_days": 25,
        "min_raw": 4500, "max_raw": 14000,
        "gi_tagged": 1,
        "dye_types": ["Walnut Hull & Saffron Tint", "Pure Natural Cashmere"],
        "base_daily_wage": 750.0,
        "festive_peaks": ["Winter Season", "Wedding Season"],
        "base_rating": 4.95
    }
]

SEASONS = [
    {"quarter": "Q1 (Jan-Mar)", "multiplier": 1.10, "season_name": "New Year & Spring Festivals"},
    {"quarter": "Q2 (Apr-Jun)", "multiplier": 0.95, "season_name": "Summer Lean Period"},
    {"quarter": "Q3 (Jul-Sep)", "multiplier": 1.15, "season_name": "Rakhi & Onam Onset"},
    {"quarter": "Q4 (Oct-Dec)", "multiplier": 1.45, "season_name": "Diwali & Wedding Season Peak"}
]

def generate_dataset(output_path: Path, num_samples: int = 650):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    
    for i in range(1, num_samples + 1):
        craft = random.choice(CRAFT_CLUSTERS)
        season = random.choice(SEASONS)
        
        production_days = random.randint(craft["min_days"], craft["max_days"])
        raw_material_cost = round(random.uniform(craft["min_raw"], craft["max_raw"]), 2)
        artisan_exp_years = random.randint(3, 38)
        
        # GI Tag variance (90% authentic GI tagged, 10% uncertified cluster variants)
        gi_tagged = 1 if random.random() < 0.92 else 0
        dye_type = random.choice(craft["dye_types"])
        
        # Grounded Fair Wage Calculation
        daily_wage = craft["base_daily_wage"]
        labor_cost = round(production_days * daily_wage, 2)
        cost_floor = round(raw_material_cost + labor_cost, 2)
        
        # Fair trade price has 25% mandatory artisan margin
        fair_trade_price = round(cost_floor * 1.25, 2)
        
        # Market clearing price accounts for GI premium (+15%), artisan experience, and seasonal multiplier
        gi_premium = 1.15 if gi_tagged else 1.0
        exp_factor = 1.0 + (artisan_exp_years * 0.005) # up to +19% for 38 yrs master craft
        seasonal_mult = season["multiplier"]
        
        market_noise = random.uniform(0.96, 1.06)
        market_clearing_price = round(
            fair_trade_price * gi_premium * exp_factor * seasonal_mult * market_noise, 2
        )
        
        # Demand score & sales
        base_demand = 70.0
        demand_score = round(min(100.0, max(20.0, (base_demand * seasonal_mult * gi_premium) + random.uniform(-5, 8))), 1)
        units_sold = int(max(2, (demand_score / 4.5) * random.uniform(0.8, 1.2)))
        buyer_rating = round(min(5.0, craft["base_rating"] + random.uniform(-0.15, 0.1)), 2)
        
        rows.append({
            "record_id": f"KS-CRAFT-{i:04d}",
            "craft_cluster": craft["cluster"],
            "state": craft["state"],
            "craft_category": craft["category"],
            "material": craft["material"],
            "production_days": production_days,
            "artisan_experience_years": artisan_exp_years,
            "raw_material_cost_inr": raw_material_cost,
            "daily_wage_rate_inr": daily_wage,
            "labor_cost_inr": labor_cost,
            "cost_floor_inr": cost_floor,
            "fair_trade_price_inr": fair_trade_price,
            "gi_tagged": gi_tagged,
            "dye_type": dye_type,
            "seasonal_quarter": season["quarter"],
            "festive_multiplier": seasonal_mult,
            "market_clearing_price_inr": market_clearing_price,
            "demand_score": demand_score,
            "units_sold_monthly": units_sold,
            "buyer_rating": buyer_rating
        })
        
    fieldnames = list(rows[0].keys())
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Generated {len(rows)} craft records in {output_path}")

if __name__ == "__main__":
    out = Path(__file__).resolve().parent / "craft_market_dataset.csv"
    generate_dataset(out, 650)
