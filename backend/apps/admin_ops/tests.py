from __future__ import annotations

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.content.models import SiteSetting
from apps.media.models import MediaFile


class AdminOpsAPITestCase(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.staff_user = self.user_model.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="adminpass123",
            is_staff=True,
            role="admin",
        )
        self.normal_user = self.user_model.objects.create_user(
            username="normaluser",
            email="user@example.com",
            password="userpass123",
            is_staff=False,
            role="member",
        )

        self.client = APIClient()
        self.admin_token = str(RefreshToken.for_user(self.staff_user).access_token)
        self.user_token = str(RefreshToken.for_user(self.normal_user).access_token)

        self.site_setting = SiteSetting.objects.create(
            organization_name="Test Org",
            short_name="Test",
        )

    def auth_header(self, token):
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_dashboard_requires_auth(self):
        response = self.client.get("/api/v1/admin/dashboard/")
        self.assertIn(response.status_code, (401, 403))

        response = self.client.get("/api/v1/admin/dashboard/", **self.auth_header(self.user_token))
        self.assertIn(response.status_code, (401, 403))

        response = self.client.get("/api/v1/admin/dashboard/", **self.auth_header(self.admin_token))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("user_count", data)
        self.assertIn("site_settings_count", data)
        self.assertEqual(data["staff_user_count"], 1)

    def test_site_settings_requires_admin(self):
        response = self.client.get("/api/v1/admin/site-settings/")
        self.assertIn(response.status_code, (401, 403))

        response = self.client.get("/api/v1/admin/site-settings/", **self.auth_header(self.user_token))
        self.assertEqual(response.status_code, 403)

        response = self.client.get("/api/v1/admin/site-settings/", **self.auth_header(self.admin_token))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(response.json(), dict))
        self.assertEqual(response.json()["organization_name"], "Test Org")

    def test_user_roles_crud(self):
        response = self.client.get("/api/v1/admin/user-roles/", **self.auth_header(self.admin_token))
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpass123",
            "role": "member",
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
        }
        create_resp = self.client.post("/api/v1/admin/user-roles/", payload, content_type="application/json", **self.auth_header(self.admin_token))
        self.assertEqual(create_resp.status_code, 201)

        user_id = create_resp.json().get("id")
        self.assertIsNotNone(user_id)

        update_payload = {"role": "editor", "is_staff": False, "is_superuser": False, "is_active": True}
        update_resp = self.client.patch(f"/api/v1/admin/user-roles/{user_id}/", update_payload, content_type="application/json", **self.auth_header(self.admin_token))
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(update_resp.json()["role"], "editor")

        delete_resp = self.client.delete(f"/api/v1/admin/user-roles/{user_id}/", **self.auth_header(self.admin_token))
        self.assertEqual(delete_resp.status_code, 204)

    def test_site_settings_crud(self):
        payload = {
            "organization_name": "Updated Org",
            "short_name": "Updated",
            "status": "published",
        }
        create_resp = self.client.post("/api/v1/admin/site-settings/", payload, content_type="application/json", **self.auth_header(self.admin_token))
        self.assertEqual(create_resp.status_code, 201)
        self.assertEqual(create_resp.json()["organization_name"], "Updated Org")

        setting_id = create_resp.json().get("id")
        update_resp = self.client.patch(f"/api/v1/admin/site-settings/{setting_id}/", {"short_name": "UpdatedShort"}, content_type="application/json", **self.auth_header(self.admin_token))
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(update_resp.json()["short_name"], "UpdatedShort")

        delete_resp = self.client.delete(f"/api/v1/admin/site-settings/{setting_id}/", **self.auth_header(self.admin_token))
        self.assertEqual(delete_resp.status_code, 204)
