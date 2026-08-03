from __future__ import annotations

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

from core.models import BaseModel


class User(AbstractUser, BaseModel):
    groups = models.ManyToManyField(
        Group,
        related_name="accounts_user_groups",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="accounts_user_permissions",
        blank=True,
    )
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True, db_index=True)
    photo = models.ImageField(upload_to="users/photos/%Y/%m/", blank=True, null=True)
    nid_or_birth_certificate = models.CharField(max_length=64, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=120, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=12, blank=True, null=True)
    role = models.CharField(max_length=32, default="member")

    class Meta:
        db_table = "accounts_user"
        indexes = [
            models.Index(fields=["email"], name="idx_accounts_user_email"),
            models.Index(fields=["phone"], name="idx_accounts_user_phone"),
            models.Index(fields=["created_at"], name="idx_accounts_user_created_at"),
            models.Index(fields=["status"], name="idx_accounts_user_status"),
        ]


class AdminProfile(BaseModel):
    user = models.OneToOneField("accounts.User", on_delete=models.CASCADE, related_name="admin_profile")
    designation = models.CharField(max_length=120)
    department = models.CharField(max_length=120, blank=True, null=True)
    can_manage_content = models.BooleanField(default=False)

    class Meta:
        db_table = "accounts_admin_profile"
        indexes = [
            models.Index(fields=["user"], name="idx_admin_profile_user"),
            models.Index(fields=["created_at"], name="idx_admin_profile_created_at"),
            models.Index(fields=["status"], name="idx_admin_profile_status"),
        ]
