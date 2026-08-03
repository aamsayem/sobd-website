from __future__ import annotations

from .responses import SuccessResponse, ErrorResponse


def response_success(message: str = "Endpoint ready.", data=None):
    return SuccessResponse(message=message, data=data).build()


def response_error(message: str = "An error occurred.", data=None):
    return ErrorResponse(message=message, data=data).build()


def validate_request_data(data):
    return data
