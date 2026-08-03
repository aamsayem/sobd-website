# SELFLESS ORGANIZATION BD (SOBD)

# SELFLESS ORGANIZATION BD

Production web application for Selfless Organization BD, built as a React + TypeScript frontend with Tailwind CSS and a Django + Django REST Framework backend backed by MySQL.

## Stack

- Frontend: React, TypeScript, Tailwind CSS, TanStack Router/Start, Vite
- Backend: Django, Django REST Framework, Simple JWT, MySQL
- Storage: Media files served from the Django backend

## Repository Layout

- `src/` - frontend application source
- `backend/` - Django project, apps, and API implementation
- `public/` - static frontend assets
- `docs/` - project and database documentation

## Local Development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver
```

## Production Notes

- Keep `.env` files out of version control.
- Configure `DB_*`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` in production.
- Build artifacts such as `dist/`, `.output/`, `node_modules/`, and Python cache directories are ignored by Git.
Admin login

Secure dashboard

EXTRA FEATURES:

SEO optimized

Fast loading

Accessibility friendly

Smooth scroll animations

Lazy loaded images

Notification system

Search functionality

Event calendar

FAQ section

Privacy policy page

Make the entire website feel emotional, trustworthy, modern, humanitarian, premium, and highly engaging. Focus heavily on clean layout, readability, professionalism, donation conversion, and transparency.

logo disi

This project is now fully configured for local development using Vite and Django.

## Deployment

Build locally with `npm run build` and deploy the generated frontend to your chosen static host or Cloudflare setup.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
