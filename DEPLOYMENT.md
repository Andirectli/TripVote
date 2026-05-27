# TripVote Deployment Guide

This guide gets TripVote from your Mac to GitHub, Vercel, and optional Supabase shared storage.

## 1. Local Check

From this folder:

```bash
cd "/Users/andrehausser/Documents/Urlaub Planung/tripvote-airbnb-shortlist google"
npm install
npm run lint
npm run build
npm run dev
```

Open `http://localhost:3000`.

Do not upload `node_modules` or `.next`. They are ignored by `.gitignore`; Vercel runs `npm install` and builds the app itself.

## 2. Push To GitHub

If this repo is already connected to `Andirectli/TripVote`, use:

```bash
git status
git add .
git commit -m "Update TripVote UI and shared storage"
git push origin main
```

If Git asks for login, use GitHub Desktop or create a GitHub personal access token and use it when Git asks for the password.

If you create a new GitHub repo instead:

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USER/TripVote.git
git branch -M main
git push -u origin main
```

## 3. Deploy On Vercel

1. Go to `https://vercel.com/new`.
2. Import the GitHub repo.
3. Framework preset: `Next.js`.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Output directory: leave empty/default.
7. Deploy.

Local-only mode works on Vercel too, but every browser has its own data. For shared votes, enable Supabase below.

## 4. Create Supabase Database

1. Create a free Supabase project.
2. Open Supabase SQL Editor.
3. Copy the full contents of `supabase/schema.sql`.
4. Run the SQL.
5. Open Project Settings > API.
6. Copy:
   - Project URL
   - anon public key

The schema uses simple public policies so a small private group can edit the trip without auth. Keep the Vercel URL private.

If you already created older test tables with UUID IDs, delete those empty test tables first or create a fresh Supabase project. TripVote uses text IDs like `airbnb-2506051` so seeded Airbnb links stay stable.

## 5. Connect Supabase To Vercel

In Vercel:

1. Open your TripVote project.
2. Go to Settings > Environment Variables.
3. Add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Save.
5. Redeploy the project.

After redeploy, accommodations, voters, votes, and trip settings are stored in Supabase and shared between everyone using the Vercel URL.

## 6. Use Supabase Locally

Create `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart:

```bash
npm run dev
```

## 7. Important Notes

- Airbnb prices and final booking terms are not scraped reliably. Check them manually.
- Availability and reservation cost are manual fields in this MVP.
- If Supabase is empty, TripVote seeds the initial Airbnb list automatically.
- If Supabase env vars are missing, the app falls back to browser `localStorage`.
- For a private group, Vercel Free and Supabase Free are enough.
