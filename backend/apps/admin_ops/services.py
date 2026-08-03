from __future__ import annotations

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from apps.admin_ops.models import CommitteeMember, CommitteePanel
from apps.content.models import SiteSetting
from apps.media.models import MediaFile

from core.api import BaseService


class AdminService(BaseService):
    def list(self, queryset):
        return queryset.all()

    def retrieve(self, queryset, pk):
        return get_object_or_404(queryset, pk=pk)

    def create(self, serializer):
        kwargs = {}
        if self.request and self.request.user.is_authenticated:
            kwargs["created_by"] = self.request.user
            kwargs["updated_by"] = self.request.user
        return serializer.save(**kwargs)

    def update(self, serializer):
        kwargs = {}
        if self.request and self.request.user.is_authenticated:
            kwargs["updated_by"] = self.request.user
        return serializer.save(**kwargs)

    def destroy(self, instance):
        instance.delete()
        return None


class DashboardService(BaseService):
    def get_statistics(self):
        user_model = get_user_model()
        return {
            "user_count": user_model.objects.count(),
            "active_user_count": user_model.objects.filter(is_active=True).count(),
            "staff_user_count": user_model.objects.filter(is_staff=True).count(),
            "committee_panel_count": CommitteePanel.objects.count(),
            "committee_member_count": CommitteeMember.objects.count(),
            "site_settings_count": SiteSetting.objects.count(),
            "media_file_count": MediaFile.objects.count(),
        }
