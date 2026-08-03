from __future__ import annotations

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.content.models import Campaign
from apps.media.models import MediaFile


class SubmissionsAPITestCase(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.staff_user = self.user_model.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="adminpass123",
            is_staff=True,
            role="admin",
        )
        self.client = APIClient()
        self.admin_token = str(RefreshToken.for_user(self.staff_user).access_token)
        self.admin_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.admin_token}"}

        self.campaign = Campaign.objects.create(
            title="Test Campaign",
            slug="test-campaign",
        )

    def test_public_volunteer_application_submission(self):
        payload = {
            "full_name": "Jane Doe",
            "present_address": "123 Main St",
            "permanent_address": "456 Side St",
            "education": "Bachelor",
            "occupation": "Developer",
            "skills": "Python",
            "blood_group": "A+",
            "nid_or_birth_certificate": "ABC123",
            "emergency_contact_name": "John Doe",
            "emergency_contact_phone": "0123456789",
            "application_status": "pending",
        }
        response = self.client.post("/api/v1/submissions/volunteer-applications/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["full_name"], "Jane Doe")

    def test_admin_list_and_modify_submissions(self):
        volunteer_payload = {
            "full_name": "Jane Doe",
            "present_address": "123 Main St",
            "permanent_address": "456 Side St",
            "education": "Bachelor",
            "occupation": "Developer",
            "skills": "Python",
            "blood_group": "A+",
            "nid_or_birth_certificate": "ABC123",
            "emergency_contact_name": "John Doe",
            "emergency_contact_phone": "0123456789",
            "application_status": "pending",
        }
        create_resp = self.client.post("/api/v1/submissions/volunteer-applications/", volunteer_payload, content_type="application/json")
        self.assertEqual(create_resp.status_code, 201)
        submission_id = create_resp.json()["id"]

        list_resp = self.client.get("/api/v1/submissions/volunteer-applications/", **self.admin_headers)
        self.assertEqual(list_resp.status_code, 200)
        self.assertTrue(any(item["id"] == submission_id for item in list_resp.json()))

        update_resp = self.client.patch(
            f"/api/v1/submissions/volunteer-applications/{submission_id}/",
            {"application_status": "reviewed"},
            content_type="application/json",
            **self.admin_headers,
        )
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(update_resp.json()["application_status"], "reviewed")

        delete_resp = self.client.delete(f"/api/v1/submissions/volunteer-applications/{submission_id}/", **self.admin_headers)
        self.assertEqual(delete_resp.status_code, 204)

    def test_public_contact_message_submission(self):
        payload = {
            "name": "Visitor",
            "email": "visitor@example.com",
            "phone": "0123456789",
            "subject": "Help",
            "message": "Please contact me.",
        }
        response = self.client.post("/api/v1/submissions/contact-messages/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["name"], "Visitor")

    def test_public_donation_submission(self):
        payload = {
            "donor_name": "Supporter",
            "phone": "0123456789",
            "email": "supporter@example.com",
            "amount": "100.00",
            "payment_method": "bkash",
            "transaction_id": "TXN12345",
            "campaign": self.campaign.id,
        }
        response = self.client.post("/api/v1/submissions/donation-requests/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["donor_name"], "Supporter")

    def test_public_sokkhom_application_submission(self):
        payload = {
            "applicant_name": "Family Member",
            "father_name": "Father Name",
            "mother_name": "Mother Name",
            "family_information": "Low income family",
            "income": "0.00",
            "occupation": "None",
            "reason": "Need support",
            "application_status": "pending",
        }
        response = self.client.post("/api/v1/submissions/sokkhom-applications/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["applicant_name"], "Family Member")
