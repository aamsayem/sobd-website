from __future__ import annotations

from django.conf import settings
from django.db import models

from core.models import BaseModel


class Campaign(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    image = models.ForeignKey("media.MediaFile", related_name="campaign_images", null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = "content_campaign"
        indexes = [
            models.Index(fields=["slug"], name="idx_campaign_slug"),
            models.Index(fields=["created_at"], name="idx_campaign_created_at"),
            models.Index(fields=["status"], name="idx_campaign_status"),
        ]


class Donation(BaseModel):
    donor_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(max_length=160, blank=True, null=True, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=60)
    transaction_id = models.CharField(max_length=120, unique=True, db_index=True)
    campaign = models.ForeignKey("content.Campaign", related_name="donations", on_delete=models.CASCADE)
    proof_screenshot = models.ForeignKey("media.MediaFile", related_name="donation_proof_screenshots", null=True, blank=True, on_delete=models.SET_NULL)
    verification_status = models.CharField(max_length=32, default="pending", db_index=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="verified_donations", null=True, blank=True, on_delete=models.SET_NULL)
    verified_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "content_donation"
        indexes = [
            models.Index(fields=["campaign"], name="idx_donation_campaign"),
            models.Index(fields=["phone"], name="idx_donation_phone"),
            models.Index(fields=["email"], name="idx_donation_email"),
            models.Index(fields=["transaction_id"], name="idx_donation_txn_id"),
            models.Index(fields=["created_at"], name="idx_donation_c_at"),
            models.Index(fields=["status"], name="idx_donation_status"),
        ]


class DonationProof(BaseModel):
    donation = models.OneToOneField("content.Donation", related_name="proof", on_delete=models.CASCADE)
    proof_file = models.ForeignKey("media.MediaFile", related_name="donation_proof_files", null=True, blank=True, on_delete=models.SET_NULL)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "content_donation_proof"
        indexes = [
            models.Index(fields=["donation"], name="idx_donation_proof_donation"),
            models.Index(fields=["created_at"], name="idx_donation_proof_created_at"),
            models.Index(fields=["status"], name="idx_donation_proof_status"),
        ]


class Gallery(BaseModel):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=80)
    description = models.TextField(blank=True, null=True)
    event_date = models.DateField(blank=True, null=True)
    images = models.ManyToManyField("media.MediaFile", related_name="gallery_images", blank=True)

    class Meta:
        db_table = "content_gallery"
        indexes = [
            models.Index(fields=["category"], name="idx_gallery_category"),
            models.Index(fields=["created_at"], name="idx_gallery_c_at"),
            models.Index(fields=["status"], name="idx_gallery_status"),
        ]


class News(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    featured_image = models.ForeignKey("media.MediaFile", related_name="featured_news_images", null=True, blank=True, on_delete=models.SET_NULL)
    content = models.TextField()
    category = models.CharField(max_length=80)
    tags = models.JSONField(blank=True, default=list)
    images = models.ManyToManyField("media.MediaFile", related_name="news_images", blank=True)

    class Meta:
        db_table = "content_news"
        indexes = [
            models.Index(fields=["slug"], name="idx_news_slug"),
            models.Index(fields=["category"], name="idx_news_category"),
            models.Index(fields=["created_at"], name="idx_news_created_at"),
            models.Index(fields=["status"], name="idx_news_status"),
        ]


class Report(BaseModel):
    title = models.CharField(max_length=200)
    pdf_file = models.ForeignKey("media.MediaFile", related_name="report_pdfs", null=True, blank=True, on_delete=models.SET_NULL)
    cover_image = models.ForeignKey("media.MediaFile", related_name="report_cover_images", null=True, blank=True, on_delete=models.SET_NULL)
    year = models.PositiveIntegerField(db_index=True)
    category = models.CharField(max_length=80, db_index=True)

    class Meta:
        db_table = "content_report"
        indexes = [
            models.Index(fields=["year"], name="idx_report_year"),
            models.Index(fields=["category"], name="idx_report_category"),
            models.Index(fields=["created_at"], name="idx_report_created_at"),
            models.Index(fields=["status"], name="idx_report_status"),
        ]


class Achievement(BaseModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    image = models.ForeignKey("media.MediaFile", related_name="achievement_images", null=True, blank=True, on_delete=models.SET_NULL)
    achievement_date = models.DateField(blank=True, null=True)
    images = models.ManyToManyField("media.MediaFile", related_name="achievement_gallery_images", blank=True)

    class Meta:
        db_table = "content_achievement"
        indexes = [
            models.Index(fields=["achievement_date"], name="idx_achievement_date"),
            models.Index(fields=["created_at"], name="idx_achievement_created_at"),
            models.Index(fields=["status"], name="idx_achievement_status"),
        ]


class ContactMessage(BaseModel):
    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=160, db_index=True)
    phone = models.CharField(max_length=20, db_index=True)
    subject = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField()

    class Meta:
        db_table = "content_contact_message"
        indexes = [
            models.Index(fields=["email"], name="idx_contact_message_email"),
            models.Index(fields=["phone"], name="idx_contact_message_phone"),
            models.Index(fields=["created_at"], name="idx_contact_msg_c_at"),
            models.Index(fields=["status"], name="idx_contact_message_status"),
        ]


class SiteSetting(BaseModel):
    organization_name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=80)
    mission = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    hero_banner = models.ForeignKey("media.MediaFile", related_name="site_setting_hero_banner", null=True, blank=True, on_delete=models.SET_NULL)
    logo = models.ForeignKey("media.MediaFile", related_name="site_setting_logo", null=True, blank=True, on_delete=models.SET_NULL)
    favicon = models.ForeignKey("media.MediaFile", related_name="site_setting_favicon", null=True, blank=True, on_delete=models.SET_NULL)
    facebook = models.URLField(max_length=255, blank=True, null=True)
    instagram = models.URLField(max_length=255, blank=True, null=True)
    youtube = models.URLField(max_length=255, blank=True, null=True)
    linkedin = models.URLField(max_length=255, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    email = models.EmailField(max_length=160, blank=True, null=True, db_index=True)
    address = models.TextField(blank=True, null=True)
    donation_information = models.TextField(blank=True, null=True)
    footer_text = models.TextField(blank=True, null=True)
    hero_images = models.ManyToManyField("media.MediaFile", related_name="site_setting_hero_images", blank=True)
    activity_images = models.ManyToManyField("media.MediaFile", related_name="site_setting_activity_images", blank=True)
    about_images = models.ManyToManyField("media.MediaFile", related_name="site_setting_about_images", blank=True)

    class Meta:
        db_table = "content_site_setting"
        indexes = [
            models.Index(fields=["email"], name="idx_site_setting_email"),
            models.Index(fields=["phone"], name="idx_site_setting_phone"),
            models.Index(fields=["created_at"], name="idx_site_setting_created_at"),
            models.Index(fields=["status"], name="idx_site_setting_status"),
        ]
