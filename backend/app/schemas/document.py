"""Document Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class DocumentBase(BaseModel):
    title: str
    doc_type: str
    trial_id: Optional[UUID] = None
    file_name: str
    file_size: int = 0
    mime_type: Optional[str] = "application/pdf"
    version: Optional[str] = "1.0"


class DocumentCreate(DocumentBase):
    file_path: str
    checksum_sha256: Optional[str] = None
    is_vaulted: Optional[bool] = False


class DocumentResponse(DocumentBase):
    id: UUID
    uploaded_by_id: Optional[UUID] = None
    file_path: str
    checksum_sha256: Optional[str] = None
    is_vaulted: bool = False
    status: str = "ACTIVE"
    uploader_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
