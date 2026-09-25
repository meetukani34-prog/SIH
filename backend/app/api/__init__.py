"""API router registry."""

from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.trials import router as trials_router
from app.api.participants import router as participants_router
from app.api.adverse_events import router as adverse_events_router
from app.api.terminology import router as terminology_router
from app.api.compliance import router as compliance_router
from app.api.documents import router as documents_router
from app.api.audit import router as audit_router
from app.api.notifications import router as notifications_router
from app.api.dashboard import router as dashboard_router
from app.api.exports import router as exports_router
from app.api.users import router as users_router
from app.api.fhir import router as fhir_router
from app.api.command_center import router as command_center_router
from app.api.deviations import router as deviations_router
from app.api.data_quality import router as data_quality_router
from app.api.safety_center import router as safety_center_router
from app.api.ctri import router as ctri_router
from app.api.visits import router as visits_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(trials_router)
api_router.include_router(participants_router)
api_router.include_router(adverse_events_router)
api_router.include_router(terminology_router)
api_router.include_router(compliance_router)
api_router.include_router(documents_router)
api_router.include_router(audit_router)
api_router.include_router(notifications_router)
api_router.include_router(dashboard_router)
api_router.include_router(exports_router)
api_router.include_router(users_router)
api_router.include_router(fhir_router)
api_router.include_router(command_center_router)
api_router.include_router(deviations_router)
api_router.include_router(data_quality_router)
api_router.include_router(safety_center_router)
api_router.include_router(ctri_router)
api_router.include_router(visits_router)
