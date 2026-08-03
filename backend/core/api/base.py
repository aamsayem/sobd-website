from __future__ import annotations

from rest_framework import serializers, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .responses import SuccessResponse, ErrorResponse


class BaseSerializer(serializers.Serializer):
    def validate(self, attrs):
        return attrs


class BaseService:
    def __init__(self, request=None):
        self.request = request

    def execute(self, *args, **kwargs):
        return None


class BaseAPIView(APIView):
    serializer_class = None
    permission_classes = []
    service_class = None

    def get_serializer_class(self):
        return self.serializer_class

    def get_service_class(self):
        return self.service_class

    def post(self, request, *args, **kwargs):
        return Response(SuccessResponse(message="Endpoint ready.", data=None).build())

    def get(self, request, *args, **kwargs):
        return Response(SuccessResponse(message="Endpoint ready.", data=None).build())

    def put(self, request, *args, **kwargs):
        return Response(SuccessResponse(message="Endpoint ready.", data=None).build())

    def patch(self, request, *args, **kwargs):
        return Response(SuccessResponse(message="Endpoint ready.", data=None).build())

    def delete(self, request, *args, **kwargs):
        return Response(SuccessResponse(message="Endpoint ready.", data=None).build())
