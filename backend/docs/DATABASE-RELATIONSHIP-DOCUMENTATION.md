# Database Relationship Documentation

## Core design principles

- Every table follows the same audit contract:
  - `id`
  - `created_at`
  - `updated_at`
  - `created_by`
  - `updated_by`
  - `status`
  - `is_active`
- Foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` where appropriate.
- The schema uses `utf8mb4` and MySQL `InnoDB` storage.
- The design avoids circular relationships and keeps media references separated into a dedicated `MediaFile` table.

## Entity relationships

### 1. User and AdminProfile
- `User` is the principal authentication model.
- `AdminProfile` is a one-to-one extension of `User`.
- One `User` can have at most one `AdminProfile`.
- `AdminProfile.user` is `ON DELETE CASCADE`.

### 2. CommitteePanel and CommitteeMember
- `CommitteePanel` is the parent panel definition.
- `CommitteeMember` belongs to exactly one panel.
- A panel can contain many members.
- `CommitteeMember.panel` is `ON DELETE CASCADE`.

### 3. Campaign and Donation
- `Campaign` is the fundraising campaign parent.
- `Donation` belongs to exactly one campaign.
- A campaign can have many donations.
- `Donation.campaign` is `ON DELETE CASCADE`.

### 4. Donation and DonationProof
- `Donation` has a one-to-one proof record.
- `DonationProof.donation` is `UNIQUE` and `ON DELETE CASCADE`.

### 5. Gallery, News, Report, Achievement
- `Gallery` stores a title/category/description event record and many images via a join table.
- `News` stores article content and supports a featured image plus many additional images.
- `Report` stores one PDF and one cover image.
- `Achievement` stores one primary image and many supporting images.

### 6. MediaFile as shared asset table
- `MediaFile` is the single source of truth for uploaded files.
- `MediaFile` is referenced by all image/pdf/photo assets across the system.
- This normalization prevents duplicate storage logic and keeps asset ownership consistent.

### 7. SiteSetting
- `SiteSetting` keeps the organization-wide brand and contact metadata.
- It references hero banner, logo, and favicon through dedicated foreign keys.
- It also contains many-to-many image collections for hero, activity, and about images.

### 8. Volunteer and Shokkhom Applications
- `VolunteerApplication` stores personal and emergency data, plus one optional photo.
- `ShokkhomApplication` stores family and income details, plus one optional photo and many supporting documents.

## Relationship summary

- `1 -> many`: `CommitteePanel -> CommitteeMember`, `Campaign -> Donation`
- `1 -> 1`: `Donation -> DonationProof`
- `many -> many`: `Gallery <-> MediaFile`, `News <-> MediaFile`, `Achievement <-> MediaFile`, `SiteSetting <-> MediaFile`, `ShokkhomApplication <-> MediaFile`

## Indexes defined

The model layer includes indexes for the requested fields:
- `email`
- `phone`
- `slug`
- `created_at`
- `status`
- `campaign_id`
- `panel_id`

## Integrity notes

- All primary keys use `BIGINT` auto-increment.
- Required fields are `NOT NULL` where appropriate.
- `VARCHAR` lengths were constrained to production-friendly sizes.
- Unique constraints were applied to key business identifiers such as `slug`, `transaction_id`, `phone`, `email`, and `stored_file_name`.
