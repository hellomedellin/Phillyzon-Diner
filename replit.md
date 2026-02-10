# Phillyzon - Restaurant Website

## Overview
Phillyzon is a bilingual (EN/ES) restaurant website for a Philly cheesesteak and burger restaurant based in Medellin, Colombia. Dark charcoal + gold theme with vintage American styling.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Session-based admin auth (email/password) using express-session

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
- `adminUsers` - Admin login (email/password)
- `menuCategories` - Categories with EN/ES names
- `menuItems` - Items with EN/ES name, description, price, featured, visible
- `promotions` - Promotions with EN/ES title, description, active, dates

## Routes
- `/` - Home page (hero, story, featured items)
- `/menu` - Full menu grouped by category
- `/promotions` - Active promotions
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

## Design
- Dark charcoal background, gold/mustard accents
- Playfair Display serif for headings, Inter sans-serif for body
- Theme always dark (no light mode toggle)
