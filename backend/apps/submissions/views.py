from __future__ import annotations

from rest_framework import permissions, viewsets
from rest_framework.routers import DefaultRouter

from apps.content.models import ContactMessage, Donation
from apps.submissions.models import ShokkhomApplication, VolunteerApplication
from apps.submissions.serializers import (
    ContactMessageSerializer,
    DonationSerializer,
    ShokkhomApplicationSerializer,
    VolunteerApplicationSerializer,
)
from apps.submissions.services import SubmissionService


class SubmissionAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == "create":
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class SubmissionModelViewSet(viewsets.ModelViewSet):
    permission_classes = [SubmissionAdminOnly]
    service_class = SubmissionService

    @property
    def service(self):
        return self.service_class()

    def perform_create(self, serializer):
        self.service.create(serializer)

    def perform_update(self, serializer):
        self.service.update(serializer)

    def perform_destroy(self, instance):
        self.service.destroy(instance)


class VolunteerApplicationViewSet(SubmissionModelViewSet):
    queryset = VolunteerApplication.objects.all().order_by("-created_at")
    serializer_class = VolunteerApplicationSerializer


class DonationRequestViewSet(SubmissionModelViewSet):
    queryset = Donation.objects.all().order_by("-created_at")
    serializer_class = DonationSerializer


class ContactMessageViewSet(SubmissionModelViewSet):
    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer


class ShokkhomApplicationViewSet(SubmissionModelViewSet):
    queryset = ShokkhomApplication.objects.all().order_by("-created_at")
    serializer_class = ShokkhomApplicationSerializer


router = DefaultRouter()
router.register(r"volunteer-applications", VolunteerApplicationViewSet, basename="volunteer-application")
router.register(r"donation-requests", DonationRequestViewSet, basename="donation-request")
router.register(r"contact-messages", ContactMessageViewSet, basename="contact-message")
router.register(r"sokkhom-applications", ShokkhomApplicationViewSet, basename="sokkhom-application")

urlpatterns = router.urls
