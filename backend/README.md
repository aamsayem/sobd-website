# SOBD Backend

This folder contains the Django + Django REST Framework backend used by the SOBD website.

## Included

- Django project bootstrap and settings
- DRF API configuration
- JWT authentication
- MySQL database settings
- CORS and CSRF configuration
- media and static file handling
- logging setup

## Structure

- `manage.py` - Django management entrypoint
- `config/` - project settings and entrypoints
- `apps/` - feature apps for accounts, content, submissions, media, admin operations, and notifications
- `core/` - shared utilities, permissions, pagination, middleware, and mixins
- `media/` - uploaded media files
- `static/` - collected static files
- `logs/` - application logs

## Notes

- The backend uses environment variables for all production-sensitive settings.
- Keep secrets and environment files out of version control.
