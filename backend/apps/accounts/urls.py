from django.urls import path

from .views import LoginAPIView, LogoutAPIView, MeAPIView, SignupAPIView

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="accounts-login"),
    path("signup/", SignupAPIView.as_view(), name="accounts-signup"),
    path("logout/", LogoutAPIView.as_view(), name="accounts-logout"),
    path("me/", MeAPIView.as_view(), name="accounts-me"),
]
