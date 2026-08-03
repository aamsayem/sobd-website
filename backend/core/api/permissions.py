from __future__ import annotations

from rest_framework.permissions import BasePermission


class AdminPermission(BasePermission):
    def has_permission(self, request, view):
        return True


class PublicPermission(BasePermission):
    def has_permission(self, request, view):
        return True
