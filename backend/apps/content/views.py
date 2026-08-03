from __future__ import annotations

from rest_framework import permissions, viewsets
from rest_framework.routers import DefaultRouter

from apps.admin_ops.models import CommitteeMember
from apps.content.models import Achievement, Campaign, Gallery, News, Report
from apps.content.serializers import (
    AchievementSerializer,
    CampaignSerializer,
    CommitteeMemberSerializer,
    GallerySerializer,
    NewsSerializer,
    ReportSerializer,
)
from apps.content.services import ContentService


class AdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class ContentModelViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminOrReadOnly]
    authentication_classes = []  # use default authentication classes from settings
    service_class = ContentService

    @property
    def service(self):
        return self.service_class()

    def perform_create(self, serializer):
        self.service.create(serializer)

    def perform_update(self, serializer):
        self.service.update(serializer)

    def perform_destroy(self, instance):
        self.service.destroy(instance)


class CommitteeMemberViewSet(ContentModelViewSet):
    queryset = CommitteeMember.objects.all().order_by("-created_at")
    serializer_class = CommitteeMemberSerializer


class CampaignViewSet(ContentModelViewSet):
    queryset = Campaign.objects.all().order_by("-created_at")
    serializer_class = CampaignSerializer


class GalleryViewSet(ContentModelViewSet):
    queryset = Gallery.objects.all().order_by("-created_at")
    serializer_class = GallerySerializer


class NewsViewSet(ContentModelViewSet):
    queryset = News.objects.all().order_by("-created_at")
    serializer_class = NewsSerializer


class ReportViewSet(ContentModelViewSet):
    queryset = Report.objects.all().order_by("-created_at")
    serializer_class = ReportSerializer


class AchievementViewSet(ContentModelViewSet):
    queryset = Achievement.objects.all().order_by("-created_at")
    serializer_class = AchievementSerializer


router = DefaultRouter()
router.register(r"committee-members", CommitteeMemberViewSet, basename="committee-member")
router.register(r"campaigns", CampaignViewSet, basename="campaign")
router.register(r"galleries", GalleryViewSet, basename="gallery")
router.register(r"news", NewsViewSet, basename="news")
router.register(r"reports", ReportViewSet, basename="report")
router.register(r"achievements", AchievementViewSet, basename="achievement")

urlpatterns = router.urls
