# NextPress

A full-stack, self-hosted CMS built with Next.js and Express/MySQL — a WordPress-style admin panel (pages, blogs, custom post types, forms, menus, media library, e-commerce, HR/careers, SEO) paired with a headless public-facing frontend.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Bootstrap 5, Redux Toolkit
- **Backend**: Node.js, Express 5, MySQL (via `mysql2`), JWT auth

## Project structure

```
frontend/    Next.js app — public site (public) + admin panel [admin]
backend/     Express API — modules/ holds one folder per domain (auth, pages,
             posts, cpt, forms, menus, media, ecommerce, careers, seo, ...)
```

## Getting started

### Prerequisites

- Node.js 18+
- MySQL 8+

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DB credentials and JWT secrets
npm run migrate         # runs backend/database/migrations
npm run seed:admin      # creates the first admin user
npm run dev              # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point at your backend URL
npm run dev                         # http://localhost:3000
```

The admin panel is available at `/<NEXT_PUBLIC_ADMIN_PATH>` (default `/admin`), using the credentials created by `seed:admin`.

## Environment variables

**`backend/.env`** — see `backend/.env.example` for the full list: server port/URLs, MySQL connection (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), JWT secrets, and CORS origin.

**`frontend/.env.local`** — see `frontend/.env.local.example`: the admin route path and the backend API URL.

Never commit real `.env` / `.env.local` files — both are already gitignored.

## Features

- Pages & blog posts with a block-based page editor and ACF-style custom fields
- Custom Post Types (CPT) builder for arbitrary content models
- Drag-and-drop menu builder
- Dynamic form builder with submission storage
- Media library with image processing
- Role/permission-based user management
- SEO management (per-page metadata, sitemap, robots)
- Optional e-commerce (products, orders, sales) and HR/careers (jobs, applications) modules

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 yadavBahubali.
