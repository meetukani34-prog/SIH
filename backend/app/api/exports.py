"""Regulatory Data Interchange & Export Center API endpoints."""

from typing import List, Dict, Any, Optional
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trial import Trial
from app.models.user import User
from app.schemas.export import ExportFormat, FHIRBundleResponse, SDTMDatasetResponse
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.services.fhir_service import generate_trial_fhir_bundle
from app.services.sdtm_service import generate_sdtm_ae, generate_sdtm_dm, generate_sdtm_ds

router = APIRouter(prefix="/exports", tags=["Regulatory Exports (FHIR / SDTM / ABDM)"])


@router.get("/formats", response_model=List[ExportFormat])
def get_supported_formats(current_user: Optional[User] = Depends(get_optional_current_user)):
    """List available standards-compliant regulatory export profiles."""
    return [
        ExportFormat(
            format="fhir_r4_abdm_json",
            description="HL7 FHIR R4 Collection Bundle with ResearchStudy, ResearchSubject, AdverseEvent, and Consent resources aligned with ABDM (Ayushman Bharat Digital Mission) specifications.",
            version="HL7 FHIR R4 / ABDM v2.0 (NHA Aligned)"
        ),
        ExportFormat(
            format="sdtm_ae_csv",
            description="CDISC SDTM v3.3 Adverse Events Domain Dataset (AE) with NCI controlled terminology.",
            version="CDISC SDTM v3.3 / CDASH"
        ),
        ExportFormat(
            format="sdtm_dm_csv",
            description="CDISC SDTM v3.3 Demographics Domain Dataset (DM) with pseudonymized subject keys.",
            version="CDISC SDTM v3.3 / CDASH"
        ),
        ExportFormat(
            format="sdtm_ds_csv",
            description="CDISC SDTM v3.3 Disposition Domain Dataset (DS) capturing subject milestone protocol completions.",
            version="CDISC SDTM v3.3 / CDASH"
        )
    ]


@router.get("/fhir/{trial_id}")
def export_trial_fhir(
    trial_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Generate and download HL7 FHIR R4 JSON Collection Bundle aligned with ABDM."""
    bundle = generate_trial_fhir_bundle(db, trial_id)
    if not bundle:
        raise HTTPException(status_code=404, detail="Trial not found or has no exportable clinical records")
    return bundle


@router.get("/sdtm/{trial_id}/{domain}")
def export_trial_sdtm(
    trial_id: str,
    domain: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Generate CDISC SDTM dataset in JSON format."""
    domain_upper = domain.upper()
    if domain_upper == "AE":
        res = generate_sdtm_ae(db, trial_id)
    elif domain_upper == "DM":
        res = generate_sdtm_dm(db, trial_id)
    elif domain_upper == "DS":
        res = generate_sdtm_ds(db, trial_id)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported SDTM domain '{domain}'. Supported: AE, DM, DS")

    if not res:
        raise HTTPException(status_code=404, detail="Trial not found")
    return res


@router.get("/csv/{trial_id}/{domain}")
def export_trial_csv(
    trial_id: str,
    domain: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Generate and download CDISC SDTM tabular CSV file."""
    domain_upper = domain.upper()
    if domain_upper == "AE":
        data = generate_sdtm_ae(db, trial_id)
    elif domain_upper == "DM":
        data = generate_sdtm_dm(db, trial_id)
    elif domain_upper == "DS":
        data = generate_sdtm_ds(db, trial_id)
    else:
        raise HTTPException(status_code=400, detail="Supported domains: AE, DM, DS")

    if not data or not data.get("records"):
        raise HTTPException(status_code=404, detail="No records found to export")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data["columns"])
    writer.writeheader()
    for row in data["records"]:
        writer.writerow(row)

    csv_content = output.getvalue()
    filename = f"SDTM_{domain_upper}_{data.get('study_id', 'TRIAL')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
