from __future__ import annotations

from rest_framework import serializers

from apps.admin_ops.models import CommitteeMember
from apps.content.models import Achievement, Campaign, Gallery, News, Report
from apps.media.models import MediaFile


class MediaFileRelatedField(serializers.PrimaryKeyRelatedField):
    def __init__(self, **kwargs):
        super().__init__(queryset=MediaFile.objects.all(), **kwargs)


class CommitteeMemberSerializer(serializers.ModelSerializer):
    photo = MediaFileRelatedField(allow_null=True, required=False)

    class Meta:
        model = CommitteeMember
        fields = "__all__"


class CampaignSerializer(serializers.ModelSerializer):
    image = MediaFileRelatedField(allow_null=True, required=False)

    class Meta:
        model = Campaign
        fields = "__all__"


class GallerySerializer(serializers.ModelSerializer):
    images = MediaFileRelatedField(many=True, required=False)

    class Meta:
        model = Gallery
        fields = "__all__"


class NewsSerializer(serializers.ModelSerializer):
    featured_image = MediaFileRelatedField(allow_null=True, required=False)
    images = MediaFileRelatedField(many=True, required=False)

    class Meta:
        model = News
        fields = "__all__"


class ReportSerializer(serializers.ModelSerializer):
    pdf_file = MediaFileRelatedField(allow_null=True, required=False)
    cover_image = MediaFileRelatedField(allow_null=True, required=False)

    class Meta:
        model = Report
        fields = "__all__"


class AchievementSerializer(serializers.ModelSerializer):
    image = MediaFileRelatedField(allow_null=True, required=False)
    images = MediaFileRelatedField(many=True, required=False)

    class Meta:
        model = Achievement
        fields = "__all__"
