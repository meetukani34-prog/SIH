"""AyurCTMS — Ayurveda Clinical Trial Management System.
FastAPI Backend Application Entrypoint.
"""

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.config import settings
from app.database import engine, Base, get_db
import app.models  # Ensure all SQLAlchemy models are registered
from app.api import api_router

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="Clinical Trial Management & Regulatory Compliance Platform for Ayurveda and Traditional Medicine.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
def on_startup():
    import os
    if os.getenv("VERCEL", "0") != "1":
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as e:
            print(f"Warning: Database tables could not be created automatically on startup: {e}")


# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

import urllib.parse

@app.middleware("http")
async def handle_vercel_rewrite_paths(request: Request, call_next):
    # Check if Vercel provided original path via __path query param or headers
    custom_path = request.query_params.get("__path")
    if custom_path:
        clean_path = custom_path
        if not clean_path.startswith("/"):
            clean_path = "/" + clean_path
        while clean_path.startswith("//"):
            clean_path = clean_path[1:]
        request.scope["path"] = clean_path

        # Clean __path from query_string
        qs = request.scope.get("query_string", b"").decode("latin1")
        if qs:
            params = urllib.parse.parse_qsl(qs, keep_blank_values=True)
            filtered = [(k, v) for k, v in params if k != "__path"]
            request.scope["query_string"] = urllib.parse.urlencode(filtered).encode("latin1")
    else:
        matched_path = request.headers.get("x-matched-path") or request.headers.get("x-invoke-path")
        if matched_path:
            clean_path = matched_path.split("?")[0]
            request.scope["path"] = clean_path
        else:
            path = request.scope.get("path", "")
            for prefix in ["/api/index.py", "/api/index", "/backend/api/index.py"]:
                if path == prefix or path == f"{prefix}/":
                    request.scope["path"] = "/"
                    break
                elif path.startswith(prefix + "/"):
                    request.scope["path"] = path[len(prefix):]
                    break
    return await call_next(request)



@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Not Found",
            "url_path": request.url.path,
            "scope_path": request.scope.get("path"),
            "root_path": request.scope.get("root_path"),
            "available_endpoints": ["/", "/health", "/docs", "/api/trials", "/api/auth/login"],
        }
    )

# Mount all API endpoints
app.include_router(api_router)



@app.get("/", tags=["Health"])
def root(request: Request):
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "regulatory_mode": "Standard 21 CFR Part 11 & AYUSH GCP Compliant Demonstration",
        "headers": dict(request.headers),
        "scope_path": request.scope.get("path"),
    }



@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


@app.get("/health/db", tags=["Health"])
def health_db(db: Session = Depends(get_db)):
    from sqlalchemy import text
    try:
        count = db.execute(text("SELECT count(*) FROM trials")).scalar()
        return {
            "status": "connected",
            "database": "Supabase PostgreSQL",
            "trials_count": count
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }



@app.get("/api/seed", tags=["Admin"])
@app.post("/api/seed", tags=["Admin"])
def trigger_seed():
    """Seed the database with initial clinical trial data and demo accounts."""
    try:
        from app.seed import seed_database
        seed_database()
        return {"status": "success", "message": "Database successfully initialized and seeded with demo data."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
