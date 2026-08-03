from __future__ import annotations

from django.db import models

from core.models import BaseModel


class VolunteerApplication(BaseModel):
    full_name = models.CharField(max_length=160)
    present_address = models.TextField()
    permanent_address = models.TextField()
    education = models.CharField(max_length=160)
    occupation = models.CharField(max_length=160)
    skills = models.TextField(blank=True, null=True)
    blood_group = models.CharField(max_length=12, blank=True, null=True)
    nid_or_birth_certificate = models.CharField(max_length=64, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=120)
    emergency_contact_phone = models.CharField(max_length=20)
    photo = models.ForeignKey("media.MediaFile", related_name="volunteer_application_photos", null=True, blank=True, on_delete=models.SET_NULL)
    application_status = models.CharField(max_length=32, default="pending", db_index=True)

    class Meta:
        db_table = "submissions_volunteer_application"
        indexes = [
            models.Index(fields=["created_at"], name="idx_volunteer_created_at"),
            models.Index(fields=["status"], name="idx_volunteer_status"),
            models.Index(fields=["application_status"], name="idx_volunteer_app_status"),
        ]


class ShokkhomApplication(BaseModel):
    applicant_name = models.CharField(max_length=160)
    father_name = models.CharField(max_length=160, blank=True, null=True)
    mother_name = models.CharField(max_length=160, blank=True, null=True)
    family_information = models.TextField()
    income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    occupation = models.CharField(max_length=160)
    reason = models.TextField()
    supporting_documents = models.ManyToManyField("media.MediaFile", related_name="shokkhom_supporting_documents", blank=True)
    photo = models.ForeignKey("media.MediaFile", related_name="shokkhom_application_photos", null=True, blank=True, on_delete=models.SET_NULL)
    application_status = models.CharField(max_length=32, default="pending", db_index=True)

    class Meta:
        db_table = "submissions_shokkhom_application"
        indexes = [
            models.Index(fields=["created_at"], name="idx_shokkhom_created_at"),
            models.Index(fields=["status"], name="idx_shokkhom_status"),
            models.Index(fields=["application_status"], name="idx_shokkhom_app_status"),
        ]
