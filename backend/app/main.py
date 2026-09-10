from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import studio, speech, pricing, catalog
from scripts.seed_craft_data import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    await init_db()
    # Run craft data seed script automatically on startup
    try:
        await seed_data()
    except Exception as e:
        print(f"Seed data notification: {e}")
    yield


app = FastAPI(
    title="KalaSetu API",
    description="AI-Driven Market Linkage & Smart Cataloging for Artisans (Ministry of Social Justice and Empowerment initiative)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["*"],  # Allow configured origins and local preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads for serving generated and uploaded images & audio
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include feature routers
app.include_router(studio.router, prefix=settings.API_PREFIX)
app.include_router(speech.router, prefix=settings.API_PREFIX)
app.include_router(pricing.router, prefix=settings.API_PREFIX)
app.include_router(catalog.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {
        "project": "KalaSetu",
        "description": "AI-Driven Market Linkage & Smart Cataloging for Marginalized Artisans",
        "initiative": "Ministry of Social Justice and Empowerment (MoSJE)",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "active"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "KalaSetu Backend", "version": settings.VERSION}
