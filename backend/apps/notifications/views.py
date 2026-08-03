from __future__ import annotations

from core.api import BaseAPIView, response_success


class NotificationAPIView(BaseAPIView):
    serializer_class = None
    service_class = None

    def get(self, request, *args, **kwargs):
        return self.get_response(response_success(message="Endpoint ready.", data=None))

    def post(self, request, *args, **kwargs):
        return self.get_response(response_success(message="Endpoint ready.", data=None))

    def get_response(self, payload):
        from rest_framework.response import Response
        return Response(payload)
