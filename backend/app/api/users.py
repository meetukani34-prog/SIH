"""Users and Role Directory API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Roles"])


@router.get("", response_model=List[UserResponse])
def get_users(
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List system users, optionally filtered by role."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    return query.all()


@router.get("/roles")
def get_system_roles():
    """Return system roles and privilege matrix."""
    return [
        {"role": "PI", "name": "Principal Investigator", "description": "Protocol design, cohort enrollment, and safety incident reporting."},
        {"role": "ETHICS", "name": "Institutional Ethics Committee", "description": "Protocol clearance, amendments, annual reviews, and statutory safety oversight."},
        {"role": "PV", "name": "Pharmacovigilance Officer", "description": "Adverse drug reaction monitoring, causality assessment, and expedited SAE tracking."},
        {"role": "REGULATOR", "name": "Regulatory Inspector (AYUSH / CDSCO)", "description": "Statutory audit trails, read-only inspections, and FHIR/SDTM export generation."},
        {"role": "ADMIN", "name": "System Administrator", "description": "User access governance, system settings, and institutional site provisioning."}
    ]
