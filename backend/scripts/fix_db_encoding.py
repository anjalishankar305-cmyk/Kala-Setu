import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.database import AsyncSessionLocal
from sqlalchemy import select
from app.models import Product
from scripts.seed_craft_data import SAMPLE_PRODUCTS

async def fix():
    async with AsyncSessionLocal() as session:
        for pdata in SAMPLE_PRODUCTS:
            result = await session.execute(
                select(Product).where(Product.title_en == pdata["title_en"])
            )
            prod = result.scalars().first()
            if prod:
                prod.title_hi = pdata["title_hi"]
                prod.description_hi = pdata["description_hi"]
                session.add(prod)
                print(f"Updated product {prod.id}: {prod.title_en[:35]} -> {prod.title_hi[:25]}")
        await session.commit()
        print("All Hindi titles and descriptions updated with pure UTF-8 successfully!")

if __name__ == "__main__":
    asyncio.run(fix())
