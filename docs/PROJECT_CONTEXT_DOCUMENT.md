# Project Context Document — SELFLESS ORGANIZATION BD (SOBD)

## 1. Project Identity

- Project name: SELFLESS ORGANIZATION BD (SOBD)
- Type: Full-stack web application for a community/NGO platform
- Purpose: Provide a digital presence and management system for public engagement, donations, volunteer recruitment, transparency reporting, and internal administration
- Repository location: [README.md](../README.md), [package.json](../package.json), [backend/requirements.txt](../backend/requirements.txt)

## 2. Executive Summary

SOBD is a hybrid web platform designed to help a charitable organization manage its public-facing operations and internal workflows through a single integrated system. The application combines a modern public website with a protected admin panel that supports content publishing, submission review, media handling, and basic analytics.

The repository contains a working implementation split between:

- A React + TypeScript frontend built with TanStack Start/Router and Tailwind CSS
- A Django + Django REST Framework backend exposing REST APIs for content and operations
- A MySQL-backed data layer modeled through Django ORM

The project is best understood as a partially migrated, content-driven NGO management system rather than a purely static website.

## 3. Problem Statement and Objectives

### Problem Statement

The organization needed a more professional and scalable digital solution to:

- present its mission, activities, and impact to the public
- receive and process donations and volunteer applications
- publish news, gallery, reports, and achievements
- manage institutional communication and internal moderation workflows
- provide a transparent and manageable administrative interface

### Objectives

1. Build a responsive public website for the NGO
2. Support donation and volunteer intake through online forms
3. Provide content management for campaigns, news, reports, and gallery items
4. Enable administrative moderation of submissions and public content
5. Create an extensible architecture suitable for future production deployment

## 4. Intended Users and Stakeholders

### Primary Users

- General visitors and supporters
- Donors
- Volunteers
- Admin staff / organization administrators

### Stakeholders

- Organization leadership
- Content managers
- Volunteer coordinators
- Donation verification staff
- Developers maintaining the platform

## 5. Functional Scope

### Public Website

The public interface includes pages for:

- Home
- About
- Activities
- Committee
- Gallery
- News
- Reports
- Contact
- Donate
- Volunteer registration

### Admin Panel

The admin area provides protected management pages for:

- Dashboard overview
- Volunteer application review
- Donation verification
- Contact message review
- Campaign management
- Committee management
- Gallery management
- News management
- Reports management
- Achievements management
- Media library access

## 6. Actual Technical Stack

### Frontend

- Framework: React with TanStack Start
- Routing: TanStack Router
- State/data fetching: TanStack Query
- Language: TypeScript
- Styling: Tailwind CSS
- UI components: Radix-inspired primitives and custom components
- Animation: Framer Motion
- Notifications: Sonner
- Validation: Zod

### Backend

- Framework: Django 5-style project structure with Django REST Framework
- Authentication: JWT via SimpleJWT
- API style: RESTful ViewSets and routers
- Database ORM: Django ORM
- Database engine: MySQL
- File handling: Django media storage with model-based file metadata

### Infrastructure/Deployment Notes

- The repository is structured for local development and future production deployment
- Settings are environment-driven and support separate development/production behavior
- The project is not yet a fully production-deployed system; it is a development foundation with many functional modules wired together

## 7. Architecture Overview

### High-Level Design

The system follows a client-server architecture:

1. Frontend routes are rendered by TanStack Start and interact with backend APIs
2. Backend endpoints are served by Django REST Framework
3. Authentication is handled through JWT tokens
4. Protected admin routes are enforced by server-side auth middleware and role checks
5. Media and content data are stored in MySQL through Django models

### Request Flow

- A visitor accesses a public page such as Donate or Volunteer
- The frontend submits form data to Django-backed endpoints through the API layer
- The backend validates and persists the data
- Admin users access protected routes and review or manage records through the admin dashboard
- The admin dashboard fetches data from dedicated endpoints and displays it in moderation tables

## 8. Frontend Structure

### Main application entry points

- [src/routes/index.tsx](../src/routes/index.tsx) — home page
- [src/routes/donate.tsx](../src/routes/donate.tsx) — donation page
- [src/routes/volunteer.tsx](../src/routes/volunteer.tsx) — volunteer registration
- [src/routes/contact.tsx](../src/routes/contact.tsx) — contact page
- [src/routes/gallery.tsx](../src/routes/gallery.tsx) — gallery listing
- [src/routes/news.tsx](../src/routes/news.tsx) — news listing
- [src/routes/reports.tsx](../src/routes/reports.tsx) — reports listing
- [src/routes/committee.tsx](../src/routes/committee.tsx) — committee page
- [src/routes/_authenticated/admin.tsx](../src/routes/_authenticated/admin.tsx) — protected admin shell
- [src/routes/_authenticated/admin.index.tsx](../src/routes/_authenticated/admin.index.tsx) — admin dashboard
- [src/routes/_authenticated/admin.volunteers.tsx](../src/routes/_authenticated/admin.volunteers.tsx) — volunteer moderation
- [src/routes/_authenticated/admin.donations.tsx](../src/routes/_authenticated/admin.donations.tsx) — donation moderation
- [src/routes/_authenticated/admin.messages.tsx](../src/routes/_authenticated/admin.messages.tsx) — message moderation
- [src/routes/_authenticated/admin.campaigns.tsx](../src/routes/_authenticated/admin.campaigns.tsx) — campaign management

### Shared frontend support files

- [src/lib/api.ts](../src/lib/api.ts) — centralized API client
- [src/lib/django-auth.ts](../src/lib/django-auth.ts) — auth token helpers
- [src/lib/admin.functions.ts](../src/lib/admin.functions.ts) — server functions for admin operations
- [src/lib/submissions.functions.ts](../src/lib/submissions.functions.ts) — submission moderation helpers
- [src/lib/media.functions.ts](../src/lib/media.functions.ts) — media upload helpers
- [src/lib/auth.ts](../src/lib/auth.ts) — authentication flow helpers

## 9. Backend Structure

### Root configuration

- [backend/config/settings.py](../backend/config/settings.py) — Django settings, database config, JWT config, CORS, logging
- [backend/config/urls.py](../backend/config/urls.py) — API routing entrypoint
- [backend/manage.py](../backend/manage.py) — Django management command entrypoint

### Django apps

- [backend/apps/accounts](../backend/apps/accounts) — user authentication, profiles, admin-role concepts
- [backend/apps/content](../backend/apps/content) — campaigns, donations, gallery, news, reports, achievements, contact messages, site settings
- [backend/apps/submissions](../backend/apps/submissions) — volunteer applications, Shokkhom-related submissions, donation intake, contact messages
- [backend/apps/media](../backend/apps/media) — uploaded file metadata and media storage support
- [backend/apps/admin_ops](../backend/apps/admin_ops) — committee panels and admin management models
- [backend/apps/notifications](../backend/apps/notifications) — notification-related modules

## 10. Key Domain Models

### Accounts

- User: custom Django user model with role, phone, profile metadata, and admin-related fields
- AdminProfile: profile information tied to users with management permissions

### Content

- Campaign: public fundraising campaigns
- Donation: donor records and verification data
- DonationProof: evidence attachment for donation validation
- Gallery: photo gallery items
- News: blog/news articles with featured image and tags
- Report: transparency documents and downloadable files
- Achievement: milestones and success stories
- ContactMessage: visitor messages from the contact page
- SiteSetting: global organization metadata used by public pages

### Submissions

- VolunteerApplication: volunteer registration forms
- ShokkhomApplication: welfare/aid application-type submissions

### Admin Ops

- CommitteePanel: logical grouping for committee members
- CommitteeMember: public-facing leadership information

### Media

- MediaFile: metadata for uploaded files, including storage path, MIME type, and size

## 11. API Design

The backend exposes API routes under /api/v1/ with sub-routes for:

- accounts
- content
- submissions
- media
- admin
- notifications

### Representative endpoint groups

- Accounts: login, signup, logout, current user profile
- Content: campaigns, committee members, gallery items, news, reports, achievements
- Submissions: volunteer applications, donation requests, contact messages, Shokkhom applications
- Admin: dashboard stats, site settings, committee panels, user roles
- Media: file upload and file metadata management

### Authentication and access model

- Public endpoints are accessible for visitors and form submissions
- Admin and moderation actions require authenticated staff/admin users
- The frontend uses JWT access tokens stored in browser storage
- Protected admin routes check the current user’s role before allowing access

## 12. Core Business Workflows

### Donation Workflow

1. User visits the donation page
2. User submits donation details, amount, payment information, and optional proof
3. The backend stores the donation submission
4. Admins review the donation and confirm or reject it
5. The system can display donation status and support transparency reporting

### Volunteer Workflow

1. Visitor submits a volunteer application form
2. The backend stores the data and assigns a review workflow
3. Admins review and approve/reject the application
4. The status is reflected in the admin dashboard and moderation tools

### Contact Message Workflow

1. Visitor submits a message via the contact form
2. The backend stores the message
3. Admins can mark the message as read/unread or delete it

### Content Management Workflow

1. Admins create or edit campaigns, news, reports, committee members, and gallery items
2. The content is stored in the database and served to the frontend via API
3. The admin UI updates associated queries after successful create/edit/delete operations

## 13. Notable Implementation Characteristics

### Strengths

- Clear separation between frontend and backend responsibilities
- RESTful API layer with structured app modules
- Admin moderation workflows are implemented for the main submission types
- Media handling exists as a first-class concern
- The architecture is extensible and suitable for future production hardening

### Important Observations

- The README describes an earlier product vision that mentions Next.js, Node.js, PostgreSQL, and other tools, but the actual repository uses a React/TanStack frontend and Django backend
- The system appears to be in a partial migration state: some parts are well wired, while others reflect a scaffold or legacy design
- Some admin routes and backend fields appear to have evolved independently, so report writers should treat the implementation as a hybrid of intended design and actual code
- The project is feature-rich conceptually, but some production concerns such as deployment automation, payment gateway integration, and full test coverage are not fully implemented in this repository snapshot

## 14. Software Engineering Relevance for a Report

This project is strong for a university Software Engineering report because it demonstrates:

- layered architecture
- frontend-backend separation
- database design through Django ORM
- authentication and authorization
- REST API design
- CRUD-style admin workflows
- content management and media handling
- role-based administration
- modular application structure

## 15. Suggested Report Emphasis Areas

A strong report should emphasize:

1. Requirements analysis and user needs
2. System design and architecture
3. Database modeling and relationships
4. API design and integration
5. Authentication and authorization mechanisms
6. User experience design for public and admin workflows
7. Implementation challenges and migration-related inconsistencies
8. Limitations and future enhancements

## 16. Key Files to Reference in the Report

- [README.md](../README.md)
- [package.json](../package.json)
- [backend/requirements.txt](../backend/requirements.txt)
- [backend/config/settings.py](../backend/config/settings.py)
- [backend/config/urls.py](../backend/config/urls.py)
- [backend/apps/accounts/models.py](../backend/apps/accounts/models.py)
- [backend/apps/content/models.py](../backend/apps/content/models.py)
- [backend/apps/submissions/models.py](../backend/apps/submissions/models.py)
- [backend/apps/media/models.py](../backend/apps/media/models.py)
- [backend/apps/admin_ops/models.py](../backend/apps/admin_ops/models.py)
- [backend/apps/content/views.py](../backend/apps/content/views.py)
- [backend/apps/submissions/views.py](../backend/apps/submissions/views.py)
- [backend/apps/admin_ops/views.py](../backend/apps/admin_ops/views.py)
- [backend/apps/media/views.py](../backend/apps/media/views.py)
- [src/routes/index.tsx](../src/routes/index.tsx)
- [src/routes/donate.tsx](../src/routes/donate.tsx)
- [src/routes/volunteer.tsx](../src/routes/volunteer.tsx)
- [src/routes/_authenticated/admin.tsx](../src/routes/_authenticated/admin.tsx)
- [src/lib/api.ts](../src/lib/api.ts)
- [src/lib/admin.functions.ts](../src/lib/admin.functions.ts)
- [src/lib/submissions.functions.ts](../src/lib/submissions.functions.ts)

## 17. Short Summary for a Report Introduction

SOBD is a web-based NGO management platform that integrates public-facing outreach with internal administrative operations. The system supports donation handling, volunteer management, content publication, media management, and transparency reporting through a modular architecture combining React/TypeScript on the frontend and Django/REST on the backend. The project demonstrates practical software engineering principles, including modular design, API-based integration, role-based access control, and structured data management.
