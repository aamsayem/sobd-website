-- MySQL schema for SOBD backend foundation
-- Generated for Django 5+ + MySQL production database design

CREATE DATABASE IF NOT EXISTS sobd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sobd;

CREATE TABLE accounts_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    is_superuser TINYINT(1) NOT NULL DEFAULT 0,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NULL,
    is_staff TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    date_joined DATETIME NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    phone VARCHAR(20) NULL UNIQUE,
    photo VARCHAR(100) NULL,
    nid_or_birth_certificate VARCHAR(64) NULL,
    emergency_contact_name VARCHAR(120) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    gender VARCHAR(12) NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'member',
    INDEX idx_accounts_user_email (email),
    INDEX idx_accounts_user_phone (phone),
    INDEX idx_accounts_user_created_at (created_at),
    INDEX idx_accounts_user_status (status),
    CONSTRAINT fk_accounts_user_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_accounts_user_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE accounts_admin_profile (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    user_id BIGINT NOT NULL UNIQUE,
    designation VARCHAR(120) NOT NULL,
    department VARCHAR(120) NULL,
    can_manage_content TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_admin_profile_user (user_id),
    INDEX idx_admin_profile_created_at (created_at),
    INDEX idx_admin_profile_status (status),
    CONSTRAINT fk_admin_profile_user FOREIGN KEY (user_id) REFERENCES accounts_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_profile_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_admin_profile_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_ops_committee_panel (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT NULL,
    INDEX idx_committee_panel_slug (slug),
    INDEX idx_committee_panel_created_at (created_at),
    INDEX idx_committee_panel_status (status),
    CONSTRAINT fk_committee_panel_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_committee_panel_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_ops_committee_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    panel_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    designation VARCHAR(120) NOT NULL,
    photo_id BIGINT NULL,
    facebook VARCHAR(255) NULL,
    email VARCHAR(160) NULL,
    phone VARCHAR(20) NULL,
    joining_date DATE NULL,
    display_order INT NOT NULL DEFAULT 0,
    INDEX idx_committee_member_panel (panel_id),
    INDEX idx_committee_member_email (email),
    INDEX idx_committee_member_phone (phone),
    INDEX idx_committee_member_created_at (created_at),
    INDEX idx_committee_member_status (status),
    CONSTRAINT fk_committee_member_panel FOREIGN KEY (panel_id) REFERENCES admin_ops_committee_panel(id) ON DELETE CASCADE,
    CONSTRAINT fk_committee_member_photo FOREIGN KEY (photo_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_committee_member_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_committee_member_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_campaign (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NULL,
    goal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    raised_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    start_date DATE NULL,
    end_date DATE NULL,
    image_id BIGINT NULL,
    INDEX idx_campaign_slug (slug),
    INDEX idx_campaign_created_at (created_at),
    INDEX idx_campaign_status (status),
    CONSTRAINT fk_campaign_image FOREIGN KEY (image_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_campaign_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_campaign_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_donation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    donor_name VARCHAR(160) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(160) NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(60) NOT NULL,
    transaction_id VARCHAR(120) NOT NULL UNIQUE,
    campaign_id BIGINT NOT NULL,
    proof_screenshot_id BIGINT NULL,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    verified_by_id BIGINT NULL,
    verified_at DATETIME(6) NULL,
    INDEX idx_donation_campaign (campaign_id),
    INDEX idx_donation_phone (phone),
    INDEX idx_donation_email (email),
    INDEX idx_donation_transaction_id (transaction_id),
    INDEX idx_donation_created_at (created_at),
    INDEX idx_donation_status (status),
    CONSTRAINT fk_donation_campaign FOREIGN KEY (campaign_id) REFERENCES content_campaign(id) ON DELETE CASCADE,
    CONSTRAINT fk_donation_proof_screenshot FOREIGN KEY (proof_screenshot_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_donation_verified_by FOREIGN KEY (verified_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_donation_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_donation_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_donation_proof (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    donation_id BIGINT NOT NULL UNIQUE,
    proof_file_id BIGINT NULL,
    notes TEXT NULL,
    INDEX idx_donation_proof_donation (donation_id),
    INDEX idx_donation_proof_created_at (created_at),
    INDEX idx_donation_proof_status (status),
    CONSTRAINT fk_donation_proof_donation FOREIGN KEY (donation_id) REFERENCES content_donation(id) ON DELETE CASCADE,
    CONSTRAINT fk_donation_proof_file FOREIGN KEY (proof_file_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_donation_proof_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_donation_proof_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_gallery (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT NULL,
    event_date DATE NULL,
    INDEX idx_gallery_category (category),
    INDEX idx_gallery_created_at (created_at),
    INDEX idx_gallery_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_gallery_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gallery_id BIGINT NOT NULL,
    mediafile_id BIGINT NOT NULL,
    UNIQUE (gallery_id, mediafile_id),
    CONSTRAINT fk_gallery_media FOREIGN KEY (gallery_id) REFERENCES content_gallery(id) ON DELETE CASCADE,
    CONSTRAINT fk_gallery_media_file FOREIGN KEY (mediafile_id) REFERENCES media_media_file(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_news (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    featured_image_id BIGINT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    tags JSON NULL,
    INDEX idx_news_slug (slug),
    INDEX idx_news_category (category),
    INDEX idx_news_created_at (created_at),
    INDEX idx_news_status (status),
    CONSTRAINT fk_news_featured_image FOREIGN KEY (featured_image_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_news_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_news_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_news_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    news_id BIGINT NOT NULL,
    mediafile_id BIGINT NOT NULL,
    UNIQUE (news_id, mediafile_id),
    CONSTRAINT fk_news_gallery_media FOREIGN KEY (news_id) REFERENCES content_news(id) ON DELETE CASCADE,
    CONSTRAINT fk_news_media_file FOREIGN KEY (mediafile_id) REFERENCES media_media_file(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    pdf_file_id BIGINT NULL,
    cover_image_id BIGINT NULL,
    year INT NOT NULL,
    category VARCHAR(80) NOT NULL,
    INDEX idx_report_year (year),
    INDEX idx_report_category (category),
    INDEX idx_report_created_at (created_at),
    INDEX idx_report_status (status),
    CONSTRAINT fk_report_pdf FOREIGN KEY (pdf_file_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_report_cover_image FOREIGN KEY (cover_image_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_report_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_report_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_achievement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    image_id BIGINT NULL,
    achievement_date DATE NULL,
    INDEX idx_achievement_date (achievement_date),
    INDEX idx_achievement_created_at (created_at),
    INDEX idx_achievement_status (status),
    CONSTRAINT fk_achievement_image FOREIGN KEY (image_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_achievement_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_achievement_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_achievement_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    achievement_id BIGINT NOT NULL,
    mediafile_id BIGINT NOT NULL,
    UNIQUE (achievement_id, mediafile_id),
    CONSTRAINT fk_achievement_gallery_media FOREIGN KEY (achievement_id) REFERENCES content_achievement(id) ON DELETE CASCADE,
    CONSTRAINT fk_achievement_media_file FOREIGN KEY (mediafile_id) REFERENCES media_media_file(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_contact_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    subject VARCHAR(200) NULL,
    message TEXT NOT NULL,
    INDEX idx_contact_message_email (email),
    INDEX idx_contact_message_phone (phone),
    INDEX idx_contact_message_created_at (created_at),
    INDEX idx_contact_message_status (status),
    CONSTRAINT fk_contact_message_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_contact_message_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_site_setting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    organization_name VARCHAR(200) NOT NULL,
    short_name VARCHAR(80) NOT NULL,
    mission TEXT NULL,
    vision TEXT NULL,
    hero_banner_id BIGINT NULL,
    logo_id BIGINT NULL,
    favicon_id BIGINT NULL,
    facebook VARCHAR(255) NULL,
    instagram VARCHAR(255) NULL,
    youtube VARCHAR(255) NULL,
    linkedin VARCHAR(255) NULL,
    whatsapp VARCHAR(20) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(160) NULL,
    address TEXT NULL,
    donation_information TEXT NULL,
    footer_text TEXT NULL,
    INDEX idx_site_setting_email (email),
    INDEX idx_site_setting_phone (phone),
    INDEX idx_site_setting_created_at (created_at),
    INDEX idx_site_setting_status (status),
    CONSTRAINT fk_site_setting_hero_banner FOREIGN KEY (hero_banner_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_setting_logo FOREIGN KEY (logo_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_setting_favicon FOREIGN KEY (favicon_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_setting_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_site_setting_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_site_setting_hero_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sitesetting_id BIGINT NOT NULL,
    mediafile_id BIGINT NOT NULL,
    UNIQUE (sitesetting_id, mediafile_id),
    CONSTRAINT fk_site_setting_hero_media FOREIGN KEY (sitesetting_id) REFERENCES content_site_setting(id) ON DELETE CASCADE,
    CONSTRAINT fk_site_setting_hero_file FOREIGN KEY (mediafile_id) REFERENCES media_media_file(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_site_setting_activity_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sitesetting_id BIGINT NOT NULL,
    mediafile_id BIGINT NOT NULL,
    UNIQUE (sitesetting_id, mediafile_id),
    CONSTRAINT fk_site_setting_activity_media FOREIGN KEY (sitesetting_id) REFERENCES content_site_setting(id) ON DELETE CASCADE,
    CONSTRAINT fk_site_setting_activity_file FOREIGN KEY (mediafile_id) REFERENCES media_media_file(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE content_site_setting_about_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sitesetting_id BIGINT NOT NULL,
    UNIQUE (sitesetting_id, mediafile_id),
    CONSTRAINT fk_site_setting_about_media FOREIGN KEY (sitesetting_id) REFERENCES content_site_setting(id) ON DELETE CASCADE,
    CONSTRAINT fk_site_setting_about_file FOREIGN KEY (mediafile_id) REFERENCES media_media_file(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE submissions_volunteer_application (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    full_name VARCHAR(160) NOT NULL,
    present_address TEXT NOT NULL,
    permanent_address TEXT NOT NULL,
    education VARCHAR(160) NOT NULL,
    occupation VARCHAR(160) NOT NULL,
    skills TEXT NULL,
    blood_group VARCHAR(12) NULL,
    nid_or_birth_certificate VARCHAR(64) NULL,
    emergency_contact_name VARCHAR(120) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    photo_id BIGINT NULL,
    application_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    INDEX idx_volunteer_created_at (created_at),
    INDEX idx_volunteer_status (status),
    INDEX idx_volunteer_application_status (application_status),
    CONSTRAINT fk_volunteer_photo FOREIGN KEY (photo_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_volunteer_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_volunteer_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE submissions_shokkhom_application (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    applicant_name VARCHAR(160) NOT NULL,
    father_name VARCHAR(160) NULL,
    mother_name VARCHAR(160) NULL,
    family_information TEXT NOT NULL,
    income DECIMAL(12,2) NOT NULL DEFAULT 0,
    occupation VARCHAR(160) NOT NULL,
    reason TEXT NOT NULL,
    photo_id BIGINT NULL,
    application_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    INDEX idx_shokkhom_created_at (created_at),
    INDEX idx_shokkhom_status (status),
    INDEX idx_shokkhom_application_status (application_status),
    CONSTRAINT fk_shokkhom_photo FOREIGN KEY (photo_id) REFERENCES media_media_file(id) ON DELETE SET NULL,
    CONSTRAINT fk_shokkhom_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_shokkhom_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE submissions_shokkhom_application_supporting_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shokkhomapplication_id BIGINT NOT NULL,
    mediafile_id BIGINT NOT NULL,
    UNIQUE (shokkhomapplication_id, mediafile_id),
    CONSTRAINT fk_shokkhom_supporting_doc FOREIGN KEY (shokkhomapplication_id) REFERENCES submissions_shokkhom_application(id) ON DELETE CASCADE,
    CONSTRAINT fk_shokkhom_supporting_media FOREIGN KEY (mediafile_id) REFERENCES media_media_file(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE media_media_file (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    created_by_id BIGINT NULL,
    updated_by_id BIGINT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL UNIQUE,
    file_type VARCHAR(80) NOT NULL,
    size BIGINT NOT NULL,
    uploaded_by_id BIGINT NULL,
    upload_date DATETIME(6) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    mime_type VARCHAR(120) NULL,
    INDEX idx_media_stored_file_name (stored_file_name),
    INDEX idx_media_file_type (file_type),
    INDEX idx_media_upload_date (upload_date),
    INDEX idx_media_created_at (created_at),
    INDEX idx_media_status (status),
    CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_media_created_by FOREIGN KEY (created_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_media_updated_by FOREIGN KEY (updated_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
