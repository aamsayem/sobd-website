from __future__ import annotations

from django.shortcuts import get_object_or_404

from core.api import BaseService


class MediaService(BaseService):
    def list(self, queryset):
        return queryset.all()

    def retrieve(self, queryset, pk):
        return get_object_or_404(queryset, pk=pk)

    def create(self, serializer):
        return serializer.save()

    def update(self, serializer):
        return serializer.save()

    def destroy(self, instance):
        instance.delete()
        return None
