-- Optional Supabase schema for TripVote – Airbnb Shortlist.
-- Local demo mode does not use Supabase. Run this only when you are ready
-- to replace browser localStorage with hosted tables.

create table if not exists public.accommodations (
  id text primary key,
  name text not null,
  location text default '',
  country_region text default '',
  airbnb_url text default '',
  maps_url text default '',
  image_url text default '',
  check_in date not null,
  check_out date not null,
  nights integer not null default 6,
  guests integer not null default 6,
  total_price numeric,
  bedrooms numeric,
  bathrooms numeric,
  beds numeric,
  max_guests integer,
  pool boolean not null default false,
  sea_access boolean not null default false,
  directly_by_sea boolean not null default false,
  garden_terrace boolean not null default false,
  parking boolean not null default false,
  air_conditioning boolean not null default false,
  kitchen boolean not null default false,
  washing_machine boolean not null default false,
  nearest_airport text default '',
  airport_distance_km numeric,
  airport_drive_time text default '',
  flight_origin text default '',
  flight_destination_airport text default '',
  flight_duration text default '',
  flight_price numeric,
  cheapest_nearby_origin text default '',
  flight_notes text default '',
  availability_status text not null default 'unknown' check (availability_status in ('available', 'unavailable', 'unknown')),
  last_availability_check_at timestamptz,
  reservation_cost_status text not null default 'unknown' check (reservation_cost_status in ('free', 'paid', 'unknown')),
  airbnb_rating numeric,
  review_count integer,
  pros text default '',
  cons text default '',
  overall_score numeric,
  status text not null default 'New' check (status in ('New', 'Review', 'Shortlist', 'Favorite', 'Out')),
  short_verdict text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voters (
  id text primary key,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.votes (
  id text primary key,
  accommodation_id text not null references public.accommodations(id) on delete cascade,
  voter_id text not null references public.voters(id) on delete cascade,
  vote text not null check (vote in ('yes', 'maybe', 'no')),
  comment text default '',
  updated_at timestamptz not null default now(),
  unique (accommodation_id, voter_id)
);

create table if not exists public.trip_settings (
  id text primary key default 'main' check (id = 'main'),
  guests integer not null default 6,
  check_in date not null,
  check_out date not null,
  destination text default '',
  origins text default '',
  cover_image_url text default '',
  updated_at timestamptz not null default now()
);

alter table public.accommodations enable row level security;
alter table public.voters enable row level security;
alter table public.votes enable row level security;
alter table public.trip_settings enable row level security;

-- For a small private group prototype, you can start with permissive policies
-- while the project URL is private. Replace these with authenticated policies
-- before sharing broadly.
drop policy if exists "Public read accommodations" on public.accommodations;
drop policy if exists "Public write accommodations" on public.accommodations;
drop policy if exists "Public read voters" on public.voters;
drop policy if exists "Public write voters" on public.voters;
drop policy if exists "Public read votes" on public.votes;
drop policy if exists "Public write votes" on public.votes;
drop policy if exists "Public read trip settings" on public.trip_settings;
drop policy if exists "Public write trip settings" on public.trip_settings;

create policy "Public read accommodations"
  on public.accommodations for select
  using (true);

create policy "Public write accommodations"
  on public.accommodations for all
  using (true)
  with check (true);

create policy "Public read voters"
  on public.voters for select
  using (true);

create policy "Public write voters"
  on public.voters for all
  using (true)
  with check (true);

create policy "Public read votes"
  on public.votes for select
  using (true);

create policy "Public write votes"
  on public.votes for all
  using (true)
  with check (true);

create policy "Public read trip settings"
  on public.trip_settings for select
  using (true);

create policy "Public write trip settings"
  on public.trip_settings for all
  using (true)
  with check (true);
