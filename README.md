# ONLY4COACHING Client Portal

## Setup Instructions

### STEP 1 — Supabase Database (do this first)

1. Go to your Supabase project: https://lnmnjuirqrncizkharsx.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase-schema.sql` and paste the entire contents
5. Click **Run** — all tables will be created

### STEP 2 — Set your admin email

Open `src/main.js` and change this line:
```
const ADMIN_EMAIL = 'andriy@only4coaching.com'
```
Replace with your actual email address.

### STEP 3 — Enable Email Auth in Supabase

1. Go to Supabase → Authentication → Providers
2. Make sure **Email** is enabled
3. Go to Authentication → Settings
4. Set **Site URL** to your Vercel URL (after deployment)
5. Add your Vercel URL to **Redirect URLs**

### STEP 4 — Deploy to GitHub + Vercel

1. Go to github.com → New repository → name it `only4coaching-portal` → Create
2. Upload all these files to the repository (drag and drop)
3. Go to vercel.com → New Project → Import your GitHub repo
4. Click Deploy — done in 60 seconds

### STEP 5 — Update Supabase redirect URL

1. Copy your Vercel URL (e.g. https://only4coaching-portal.vercel.app)
2. Go to Supabase → Authentication → URL Configuration
3. Add the Vercel URL to Site URL and Redirect URLs

### STEP 6 — Add your domain (optional)

In Vercel → Settings → Domains → add `portal.only4coaching.com`

---

## How it works

**New client flow:**
1. Send them: `https://yoursite.vercel.app/onboarding`
2. They complete the 5-step form
3. Their data appears in your admin panel instantly
4. You activate their portal access and send invite

**Your admin login:**
- Go to your portal URL
- Enter your email → receive magic link → you're in as admin

**Client login:**
- Client goes to your portal URL
- Enters their email → receives magic link → sees their personal portal

---

## Files overview

```
only4coaching-portal/
├── index.html              # Entry point
├── styles.css              # All styles
├── vercel.json             # Deployment config
├── supabase-schema.sql     # Run this in Supabase SQL editor
├── src/
│   ├── main.js             # Router + auth
│   ├── lib/
│   │   └── supabase.js     # Database connection
│   └── pages/
│       ├── login.js        # Login screen
│       ├── onboarding.js   # New client onboarding flow
│       ├── client.js       # Client portal (all tabs)
│       └── admin.js        # Admin panel (all tabs)
```
