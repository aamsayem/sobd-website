from __future__ import annotations

from django.conf import settings
from django.db import models

from core.models import BaseModel


class MediaFile(BaseModel):
    original_file_name = models.CharField(max_length=255)
    stored_file_name = models.CharField(max_length=255, unique=True, db_index=True)
    file_type = models.CharField(max_length=80)
    size = models.BigIntegerField(default=0)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="uploaded_media_files", null=True, blank=True, on_delete=models.SET_NULL)
    upload_date = models.DateTimeField(auto_now_add=True, db_index=True)
    file_path = models.CharField(max_length=1024)
    mime_type = models.CharField(max_length=120, blank=True, null=True)

    class Meta:
        db_table = "media_media_file"
        indexes = [
            models.Index(fields=["stored_file_name"], name="idx_media_stored_file_name"),
            models.Index(fields=["file_type"], name="idx_media_file_type"),
            models.Index(fields=["upload_date"], name="idx_media_upload_date"),
            models.Index(fields=["created_at"], name="idx_media_created_at"),
            models.Index(fields=["status"], name="idx_media_status"),
        ]
