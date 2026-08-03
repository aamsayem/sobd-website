from __future__ import annotations

from rest_framework import serializers

from apps.content.models import ContactMessage, Donation
from apps.submissions.models import ShokkhomApplication, VolunteerApplication


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = "__all__"


class ShokkhomApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShokkhomApplication
        fields = "__all__"


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = "__all__"
        extra_kwargs = {
            "verified_by": {"read_only": True},
            "verified_at": {"read_only": True},
        }
