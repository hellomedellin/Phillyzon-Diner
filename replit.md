# Phillyzon - Restaurant Website

## Overview
Phillyzon is a bilingual (EN/ES) restaurant website for a Philly cheesesteak and burger restaurant based in Medellin, Colombia. Dark charcoal + gold theme with vintage American styling.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Session-based admin auth (email/password) using express-session + bcrypt

## Key Files
- `shared/schema.ts` - Drizzle schema definitions (all tables)
- `server/routes.ts` - API routes with admin auth middleware
- `server/storage.ts` - Database storage layer (IStorage interface)
- `server/db.ts` - Database connection
- `server/seed.ts` - Seed data for categories, items, promotions
- `client/src/lib/i18n.ts` - Translation system (static UI strings)
- `client/src/lib/language-context.tsx` - React language context provider
- `client/src/components/layout.tsx` - Public site header/footer/layout
- `client/src/pages/` - All page components

## Data Model
- `adminUsers` - Admin login (email/password with bcrypt hash)
- `menuCategories` - Categories with EN/ES names
- `menuItems` - Items with EN/ES name, description, price, featured, visible, imageUrl
- `promotions` - Promotions with EN/ES title, description, active, dates, imageUrl

## Routes
- `/` - Home page (hero, story, promotions preview, featured items)
- `/menu` - Full menu grouped by category
- `/promotions` - Active promotions with urgency badges
- `/visit` - Location, hours, map, WhatsApp
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin CRUD panel

## Admin Credentials (Seed)
- Email: admin@phillyzon.com
- Password: phillyzon2024

## Bilingual System
- Default language: Spanish (es)
- Static UI strings in `client/src/lib/i18n.ts`
- Database content has `_en` and `_es` columns
- Language persisted in localStorage
- Admin forms use flag labels (English/Espanol with country flags)
- Both language fields required for all content

## Design System
- **Background**: #111111 (0 0% 7%)
- **Foreground**: #f3ecd8 (40 50% 90%)
- **Accent/Gold**: #c89b3c (40 55% 51%) — used for primary, accent, ring
- **Muted**: #2a2a2a (0 0% 16%)
- **Fonts**: Cinzel (serif headings, uppercase by default), Inter (body), Bebas Neue (display/prices)
- **Border radius**: Tight (0.25rem), no bubbly rounding
- **Theme**: Always dark (no light mode toggle)
- **CSS utility classes**: `.marquee-header`, `.star-divider`, `.film-grain`, `.gold-text`, `.font-display`, `.marquee-glow`, `.warm-vignette`, `.film-strip-border`
- User's attached movie-poster images used as hero backgrounds
- Menu styled after actual restaurant menu: marquee category headers, list layout, uppercase item names, italic descriptions

## Image Uploads
- Stored in /uploads directory, served statically
- 5MB file size limit, image types only (jpeg/png/webp/gif)
- Admin-protected POST/DELETE endpoints at /api/admin/upload
- ImageUploader component for admin forms

## Security
- Passwords hashed with bcrypt (10 rounds)
- Server-side admin auth middleware on all /api/admin/* routes
- Session-based authentication with express-session
