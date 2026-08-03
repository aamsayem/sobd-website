from __future__ import annotations

from django.db import models

from core.models import BaseModel


class CommitteePanel(BaseModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=160, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "admin_ops_committee_panel"
        indexes = [
            models.Index(fields=["slug"], name="idx_committee_panel_slug"),
            models.Index(fields=["created_at"], name="idx_committee_panel_c_at"),
            models.Index(fields=["status"], name="idx_committee_panel_status"),
        ]


class CommitteeMember(BaseModel):
    panel = models.ForeignKey("admin_ops.CommitteePanel", related_name="members", on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    designation = models.CharField(max_length=120)
    photo = models.ForeignKey("media.MediaFile", related_name="committee_member_photos", null=True, blank=True, on_delete=models.SET_NULL)
    facebook = models.URLField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=160, blank=True, null=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    joining_date = models.DateField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        db_table = "admin_ops_committee_member"
        indexes = [
            models.Index(fields=["panel"], name="idx_committee_member_panel"),
            models.Index(fields=["email"], name="idx_committee_member_email"),
            models.Index(fields=["phone"], name="idx_committee_member_phone"),
            models.Index(fields=["created_at"], name="idx_committee_member_c_at"),
            models.Index(fields=["status"], name="idx_committee_member_status"),
        ]
