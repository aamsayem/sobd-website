from __future__ import annotations

from django.conf import settings
from rest_framework import serializers

from apps.media.models import MediaFile


class MediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = [
            "id",
            "original_file_name",
            "stored_file_name",
            "file_type",
            "mime_type",
            "size",
            "file_path",
            "url",
            "uploaded_by",
            "upload_date",
            "status",
        ]
        read_only_fields = ["stored_file_name", "file_path", "url", "uploaded_by", "upload_date", "status"]

    def get_url(self, obj: MediaFile):
        request = self.context.get("request")
        if obj.file_path:
            if request is not None:
                return request.build_absolute_uri(settings.MEDIA_URL + obj.file_path)
            return settings.MEDIA_URL + obj.file_path
        return None
