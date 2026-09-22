"""AI-Assisted Terminology Harmonizer API endpoint."""

from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.adverse_event import TerminologySuggestRequest, TerminologySuggestResponse
from app.auth.dependencies import get_current_user
from app.services.ai_terminology_service import suggest_terminology

router = APIRouter(prefix="/terminology", tags=["AI Terminology Harmonizer"])


@router.post("/suggest", response_model=TerminologySuggestResponse)
def get_terminology_suggestions(
    req: TerminologySuggestRequest,
    current_user: User = Depends(get_current_user)
):
    """Map natural clinical descriptions / Classical Ayurvedic symptoms to MedDRA terms and SOC codes with confidence scoring."""
    suggestions = suggest_terminology(req.term, req.context)
    return TerminologySuggestResponse(
        query=req.term,
        suggestions=suggestions,
        source="AyurCTMS AI Terminology Harmonizer (Clinical Demo)"
    )
