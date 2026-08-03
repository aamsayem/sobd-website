from __future__ import annotations


class Pagination:
    page_size = 20

    @staticmethod
    def paginate(queryset, request):
        return queryset
