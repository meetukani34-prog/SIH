"""AyurCTMS — Ayurveda Clinical Trial Management System.
FastAPI Backend Application Entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all SQLAlchemy models are registered
from app.api import api_router

# Initialize database schema tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Clinical Trial Management & Regulatory Compliance Platform for Ayurveda and Traditional Medicine.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API endpoints
app.include_router(api_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "regulatory_mode": "Standard 21 CFR Part 11 & AYUSH GCP Compliant Demonstration"
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
