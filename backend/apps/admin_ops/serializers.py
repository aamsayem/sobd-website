from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.admin_ops.models import CommitteePanel
from apps.content.models import SiteSetting
from apps.media.models import MediaFile


class MediaFilePrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def __init__(self, **kwargs):
        super().__init__(queryset=MediaFile.objects.all(), **kwargs)


class CommitteePanelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommitteePanel
        fields = ["id", "name", "slug", "description", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class SiteSettingSerializer(serializers.ModelSerializer):
    hero_banner = MediaFilePrimaryKeyRelatedField(allow_null=True, required=False)
    logo = MediaFilePrimaryKeyRelatedField(allow_null=True, required=False)
    favicon = MediaFilePrimaryKeyRelatedField(allow_null=True, required=False)
    hero_images = MediaFilePrimaryKeyRelatedField(many=True, required=False)
    activity_images = MediaFilePrimaryKeyRelatedField(many=True, required=False)
    about_images = MediaFilePrimaryKeyRelatedField(many=True, required=False)

    class Meta:
        model = SiteSetting
        fields = [
            "id",
            "organization_name",
            "short_name",
            "mission",
            "vision",
            "hero_banner",
            "logo",
            "favicon",
            "facebook",
            "instagram",
            "youtube",
            "linkedin",
            "whatsapp",
            "phone",
            "email",
            "address",
            "donation_information",
            "footer_text",
            "hero_images",
            "activity_images",
            "about_images",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserRoleSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "role",
            "is_staff",
            "is_superuser",
            "is_active",
            "password",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=["password"])
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=["password"])
        return user


class DashboardStatsSerializer(serializers.Serializer):
    user_count = serializers.IntegerField()
    active_user_count = serializers.IntegerField()
    staff_user_count = serializers.IntegerField()
    committee_panel_count = serializers.IntegerField()
    committee_member_count = serializers.IntegerField()
    site_settings_count = serializers.IntegerField()
    media_file_count = serializers.IntegerField()
