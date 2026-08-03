from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.core.files.storage import default_storage
from django.utils.text import slugify
from rest_framework import permissions, status, viewsets
from rest_framework.parsers import FileUploadParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from apps.media.models import MediaFile
from apps.media.serializers import MediaSerializer
from apps.media.services import MediaService


class AdminUploadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class MediaFileViewSet(viewsets.ModelViewSet):
    queryset = MediaFile.objects.all().order_by("-upload_date")
    serializer_class = MediaSerializer
    permission_classes = [AdminUploadOnly]
    authentication_classes = []
    parser_classes = [MultiPartParser, FileUploadParser]
    service_class = MediaService

    @property
    def service(self):
        return self.service_class()

    def create(self, request, *args, **kwargs):
        upload = request.FILES.get("file")
        if not upload:
            return Response(
                {"detail": "No file was provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        original_name = Path(upload.name).name
        stem = slugify(Path(original_name).stem)[:80] or "file"
        suffix = Path(original_name).suffix.lower()
        stored_name = f"{uuid4().hex}-{stem}{suffix}"
        relative_path = f"uploads/{stored_name}"
        saved_path = default_storage.save(relative_path, upload)

        media_file = MediaFile.objects.create(
            original_file_name=original_name,
            stored_file_name=stored_name,
            file_type=upload.content_type or "application/octet-stream",
            mime_type=upload.content_type or "application/octet-stream",
            size=upload.size,
            uploaded_by=request.user if request.user.is_authenticated else None,
            file_path=saved_path,
        )
        serializer = self.get_serializer(media_file)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        self.service.update(serializer)

    def perform_destroy(self, instance):
        self.service.destroy(instance)


router = DefaultRouter()
router.register(r"files", MediaFileViewSet, basename="media-file")

urlpatterns = router.urls
