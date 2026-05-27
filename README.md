# TripVote – Airbnb Shortlist

TripVote is a local-first web app for comparing Airbnb vacation rentals and letting a small group vote on the shortlist.

It is built for a group beach trip with 6 adults, dates `2026-08-24` to `2026-08-30`, and up to 10 voters. The first version runs immediately with mock seed data and browser `localStorage`. No Supabase, Vercel, GitHub, paid flight API, or API credentials are required for the local demo.

## Features

- Card-based Airbnb shortlist
- Mobile-friendly detail pages
- Manual add/edit form for listing data
- Airbnb URL assistant for room ID, dates, guests, public title/image metadata, and some visible facts
- Flight price/time fields for Düsseldorf, Köln, or cheaper nearby origins
- Manual availability status with last checked timestamp
- Manual reservation-cost status
- Local browser persistence for edits and votes
- Optional Supabase sync for shared Vercel voting
- Up to 10 voters
- One vote per voter per accommodation
- Voters can change or clear votes
- Yes / Maybe / No counts
- Approval rate and group decision logic
- Ranked results page
- Filters and sorting
- Optional Supabase schema for later hosted storage
- Vercel-ready Next.js app

## Screenshots

Add screenshots here after your first local run:

- Shortlist
- Accommodation detail
- Voting section
- Results
- Voters
- Settings

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS 4
- React 19
- lucide-react icons
- Optional Supabase later

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The app works without a `.env` file.

## Local Mode

Local mode uses:

- Seed data from `src/lib/seed-data.ts`
- TypeScript models from `src/lib/types.ts`
- Browser persistence through `localStorage`
- Voting and ranking logic from `src/lib/calculations.ts`

The seeded Airbnb entries include the provided URLs, trip dates, 6 guests, 6 nights, `New` status, `Nicht geprüft` availability, `Reservierung ungeprüft` reservation status, placeholder images, and empty manual fields.

The add/edit form includes an **Analyze URL** button. It parses Airbnb URL parameters and tries to read public Open Graph metadata such as title and image. It may also infer simple visible facts from the metadata text, for example rating, bedrooms, beds, bathrooms, pool, or sea words when Airbnb exposes them.

It does not bypass Airbnb, automate login, or guarantee final prices. Open each listing yourself and manually check final price, fees, amenities, reviews, airport access, pros, cons, score, and flight data.

Availability and reservation cost are intentionally manual in this MVP. Set each listing to `Verfügbar`, `Nicht verfügbar`, or `Nicht geprüft`, and choose whether reserving is free or costs money in the add/edit form. When you change availability to a checked state, TripVote stores a fresh `lastAvailabilityCheckAt` timestamp and shows `Zuletzt geprüft` on the listing.

To reset local demo data, open **Settings** and click **Reset local demo data**.

## Voting Logic

Votes:

- `yes`
- `maybe`
- `no`
- empty / not voted

Group decision:

- Active voters = `0`: `Set voters`
- Yes votes / active voters >= `70%`: `🔥 Group favorite`
- No votes / active voters >= `40%`: `❌ Probably out`
- Maybe votes / active voters >= `40%`: `🤔 Discuss`
- Otherwise: `🔍 Open`

Examples:

- 6 active voters and 4 yes votes = `66.7%`, not quite group favorite
- 6 active voters and 5 yes votes = `83.3%`, group favorite
- 10 active voters and 7 yes votes = `70%`, group favorite
- 10 active voters and 4 no votes = `40%`, probably out

## Ranking Logic

The ranked results page uses a transparent score in `src/lib/calculations.ts`.

Ranking considers:

- Group decision
- Approval rate
- Overall score
- Price per person per night
- Airport distance
- Flight price
- Status

Group sentiment is weighted most heavily, then listing quality, then value, airport convenience, and flight cost. Missing price, airport distance, or flight data is handled gently so early shortlist items are not buried just because manual data has not been filled yet.

## Filters And Sorting

Filters:

- Pool
- Sea access
- Directly by the sea
- Garden / terrace
- Parking
- Air conditioning
- Max price per person per night
- Max airport distance in km
- Country / region
- Status
- Group decision

Sorting:

- Price per person per night ascending
- Approval rate descending
- Overall score descending
- Airport distance ascending
- Total price ascending
- Flight price ascending

## Data Model

Core models live in `src/lib/types.ts`.

Accommodation:

- `id`
- `name`
- `location`
- `countryRegion`
- `airbnbUrl`
- `mapsUrl`
- `imageUrl`
- `checkIn`
- `checkOut`
- `nights`
- `guests`
- `totalPrice`
- `bedrooms`
- `bathrooms`
- `beds`
- `maxGuests`
- `pool`
- `seaAccess`
- `directlyBySea`
- `gardenTerrace`
- `parking`
- `airConditioning`
- `kitchen`
- `washingMachine`
- `nearestAirport`
- `airportDistanceKm`
- `airportDriveTime`
- `flightOrigin`
- `flightDestinationAirport`
- `flightDuration`
- `flightPrice`
- `cheapestNearbyOrigin`
- `flightNotes`
- `availabilityStatus`
- `lastAvailabilityCheckAt`
- `reservationCostStatus`
- `airbnbRating`
- `reviewCount`
- `pros`
- `cons`
- `overallScore`
- `status`
- `shortVerdict`
- `notes`

Voter:

- `id`
- `name`
- `active`

Vote:

- `id`
- `accommodationId`
- `voterId`
- `vote`
- `comment`
- `updatedAt`

## Optional Supabase Setup

Supabase is not required for the local version.

When you want hosted shared storage so votes stay the same for everyone:

1. Create a free Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Copy your project URL and anon key.
5. Create `.env.local`:

```bash
cp .env.example .env.local
```

6. Fill:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

When these variables are present, TripVote stores accommodations, voters, votes, and trip settings in Supabase. Without them, it falls back to browser `localStorage`.

## Vercel Free Deployment

The app can be hosted on Vercel Free/Hobby with a free `vercel.app` subdomain.

### Push To GitHub

```bash
git init
git add .
git commit -m "Initial TripVote app"
git branch -M main
git remote add origin https://github.com/YOUR_USER/tripvote-airbnb-shortlist.git
git push -u origin main
```

For the full step-by-step GitHub, Vercel, and Supabase guide, see `DEPLOYMENT.md`.

### Import Into Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the GitHub repository.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Output directory: leave default.
6. Deploy.

### Supabase Env Vars On Vercel

Only add these if you later implement Supabase-backed storage:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then redeploy.

## Free-Tier Notes

TripVote is designed for a small private group:

- No file uploads
- Image URLs only
- No credentialed Airbnb scraping
- No live flight-price scraping
- Lightweight client-side calculations
- No serverless functions required in local mode
- Supabase later only needs small tables and simple queries

## Known Limitations

- Local mode stores data in one browser on one device.
- Sharing the app URL from local mode will not sync votes between friends.
- Supabase tables are prepared, but the UI is not yet wired to Supabase.
- There is no authentication in the first version.
- Airbnb final prices and fees must be checked manually.
- Flight prices are manual/assisted until an official flight search API is connected.

## Future Improvements

- Supabase-backed shared storage
- Optional flight-search API integration
- Optional official listing import provider if available
- Optional simple invite code
- Auth or magic-link voting
- CSV import/export
- Better image handling and thumbnail validation
- Per-trip workspaces
- Comments thread per accommodation
- Shareable read-only results page
