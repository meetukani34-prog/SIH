"""Export schemas for FHIR R4 and CDISC SDTM data exchange."""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class ExportFormat(BaseModel):
    format: str  # fhir_r4_json, sdtm_ae_csv, sdtm_dm_csv, summary_pdf
    description: str
    version: str
    status: str = "COMPLIANT_DEMO"


class FHIRBundleResponse(BaseModel):
    resourceType: str = "Bundle"
    type: str = "collection"
    timestamp: datetime
    total: int
    entry: List[Dict[str, Any]]
    meta: Dict[str, Any]


class SDTMDatasetResponse(BaseModel):
    domain: str  # AE, DM, DS
    study_id: str
    generated_at: datetime
    record_count: int
    columns: List[str]
    records: List[Dict[str, Any]]
