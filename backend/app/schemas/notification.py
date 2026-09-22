"""Notification Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str = "INFO"
    severity: str = "INFO"
    link: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: UUID


class NotificationUpdate(BaseModel):
    is_read: bool = True


class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
