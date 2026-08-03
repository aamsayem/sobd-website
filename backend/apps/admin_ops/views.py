from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from apps.admin_ops.models import CommitteePanel
from apps.admin_ops.serializers import (
    CommitteePanelSerializer,
    DashboardStatsSerializer,
    SiteSettingSerializer,
    UserRoleSerializer,
)
from apps.admin_ops.services import AdminService, DashboardService
from apps.content.models import SiteSetting


class AdminModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    service_class = AdminService

    @property
    def service(self):
        return self.service_class(request=self.request)

    def perform_create(self, serializer):
        self.service.create(serializer)

    def perform_update(self, serializer):
        self.service.update(serializer)

    def perform_destroy(self, instance):
        self.service.destroy(instance)


class CommitteePanelViewSet(AdminModelViewSet):
    queryset = CommitteePanel.objects.all().order_by("-created_at")
    serializer_class = CommitteePanelSerializer


class SiteSettingViewSet(AdminModelViewSet):
    queryset = SiteSetting.objects.all().order_by("-created_at")
    serializer_class = SiteSettingSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            instance = queryset.first()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return super().list(request, *args, **kwargs)


class UserRoleViewSet(AdminModelViewSet):
    queryset = get_user_model().objects.all().order_by("-created_at")
    serializer_class = UserRoleSerializer


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]
    service_class = DashboardService

    @property
    def service(self):
        return self.service_class()

    def list(self, request):
        stats = self.service.get_statistics()
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="statistics")
    def statistics(self, request):
        return self.list(request)


router = DefaultRouter()
router.register(r"committee-panels", CommitteePanelViewSet, basename="committee-panel")
router.register(r"site-settings", SiteSettingViewSet, basename="site-setting")
router.register(r"user-roles", UserRoleViewSet, basename="user-role")
router.register(r"dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = router.urls
