# Deployment Guide — Phillyzon Diner

## Stack
- **Railway** — Node.js app + PostgreSQL database
- **Cloudflare** — domain, DNS, SSL, CDN
- **Cloudflare R2** — image storage (menu photos, promotions)

---

## Step 1 — Push code to GitHub

Make sure all changes are committed and pushed to your GitHub repo before deploying.

---

## Step 2 — Set up Cloudflare R2 (image storage)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage**
2. Click **Create bucket** → name it `phillyzon-uploads`
3. Open the bucket → **Settings** → enable **Public Access** (or connect a custom domain)
   - Public URL will be something like `https://pub-xxxx.r2.dev` or your custom domain
4. Go back to R2 overview → **Manage R2 API Tokens** → **Create API Token**
   - Permissions: **Object Read & Write** on `phillyzon-uploads`
   - Copy: **Account ID**, **Access Key ID**, **Secret Access Key**

### (Optional) Custom image domain
For URLs like `https://images.phillyzon.com` instead of `https://pub-xxxx.r2.dev`:
1. R2 bucket → Settings → Custom Domains → Add `images.phillyzon.com`
2. Cloudflare adds the DNS record automatically

---

## Step 3 — Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your Phillyzon repo
3. Railway auto-detects Node.js — set:
   - **Build command:** `npm run build`
   - **Start command:** `npm run start`
4. Click **Add Plugin** → **PostgreSQL** — Railway injects `DATABASE_URL` automatically
5. Go to your service → **Variables** → add all env vars from `.env.example`:

```
SESSION_SECRET=<openssl rand -hex 32>
NODE_ENV=production
R2_ACCOUNT_ID=<from step 2>
R2_ACCESS_KEY_ID=<from step 2>
R2_SECRET_ACCESS_KEY=<from step 2>
R2_BUCKET_NAME=phillyzon-uploads
R2_PUBLIC_URL=https://images.phillyzon.com
```

6. Railway builds and deploys — you get a `xxx.railway.app` URL

### Run database migrations (first deploy only)
Railway dashboard → your service → **Shell** tab:
```bash
npm run db:push
```

---

## Step 4 — Connect your Cloudflare domain

1. **Cloudflare dashboard** → your domain → **DNS** → **Add record**
   - Type: `CNAME`
   - Name: `@` (or `www`)
   - Target: your Railway URL (e.g. `xxx.railway.app`)
   - Proxy: **On** (orange cloud) — enables Cloudflare CDN + SSL
2. Railway dashboard → your service → **Settings** → **Custom Domain** → add your domain
3. SSL certificate is automatic via Cloudflare

---

## Deploying updates

Just push to GitHub — Railway redeploys automatically on every push to `main`.

---

## Local development

```bash
# Start local Postgres (requires Docker Desktop)
docker-compose up -d

# Copy and fill in env vars
cp .env.example .env

# Create database tables (first time only)
npm run db:push

# Start dev server with hot reload
npm run dev
# → http://localhost:5000
```

For image uploads locally, add your real R2 credentials to `.env`. Images go to the same R2 bucket as production.

---

## Environment variables reference

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Auto-set by Railway PostgreSQL plugin |
| `SESSION_SECRET` | Run: `openssl rand -hex 32` |
| `R2_ACCOUNT_ID` | Cloudflare dashboard → R2 → right sidebar |
| `R2_ACCESS_KEY_ID` | R2 → Manage R2 API Tokens |
| `R2_SECRET_ACCESS_KEY` | R2 → Manage R2 API Tokens |
| `R2_BUCKET_NAME` | Name you gave the bucket (e.g. `phillyzon-uploads`) |
| `R2_PUBLIC_URL` | R2 bucket public URL or custom domain |
