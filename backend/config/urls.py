from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path("api/v1/accounts/", include("apps.accounts.urls")),
    path("api/v1/content/", include("apps.content.urls")),
    path("api/v1/submissions/", include("apps.submissions.urls")),
    path("api/v1/media/", include("apps.media.urls")),
    path("api/v1/admin/", include("apps.admin_ops.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
