from __future__ import annotations


class SearchFilter:
    @staticmethod
    def apply(queryset, request):
        return queryset


class OrderingFilter:
    @staticmethod
    def apply(queryset, request):
        return queryset
