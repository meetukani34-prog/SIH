"""Site Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SiteBase(BaseModel):
    name: str
    location: Optional[str] = None
    institution: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    status: Optional[str] = "ACTIVE"


class SiteCreate(SiteBase):
    pass


class SiteResponse(SiteBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
