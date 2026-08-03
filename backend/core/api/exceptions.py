from __future__ import annotations


class CustomException(Exception):
    def __init__(self, message: str = "An error occurred.", code: str = "custom_error"):
        self.message = message
        self.code = code
        super().__init__(message)
