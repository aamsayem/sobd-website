from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class APIResponse:
    success: bool = True
    message: str = "Endpoint ready."
    data: Any = None

    def build(self):
        return {
            "success": self.success,
            "message": self.message,
            "data": self.data,
        }


class SuccessResponse(APIResponse):
    def __init__(self, message: str = "Endpoint ready.", data: Any = None):
        super().__init__(success=True, message=message, data=data)


class ErrorResponse(APIResponse):
    def __init__(self, message: str = "An error occurred.", data: Any = None):
        super().__init__(success=False, message=message, data=data)
