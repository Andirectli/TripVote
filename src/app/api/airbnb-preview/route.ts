import { NextResponse } from "next/server";


type ParsedAirbnbFields = {
  name?: string;
  location?: string;
  airbnbUrl?: string;
  imageUrl?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  pool?: boolean;
  seaAccess?: boolean;
  directlyBySea?: boolean;
  airbnbRating?: number;
  reviewCount?: number;
  shortVerdict?: string;
  mapsUrl?: string;
};

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string };

  if (!url) {
    return NextResponse.json(
      { error: "Missing Airbnb URL." },
      { status: 400 },
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Please paste a valid Airbnb URL." },
      { status: 400 },
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (!hostname.includes("airbnb.") && !hostname.includes("abnb.me")) {
    return NextResponse.json(
      { error: "This importer currently understands Airbnb URLs only." },
      { status: 400 },
    );
  }

  const warnings = [
    "Airbnb prices and amenities are not reliably encoded in the URL.",
    "The app only uses URL parameters plus public page metadata. Final price, pool, sea access, beds, and reviews should still be checked manually.",
  ];

  let fields: ParsedAirbnbFields = {};

  try {
    const result = await fetchOpenGraph(parsedUrl.toString());
    fields = result.fields;
    if (result.warnings) {
      warnings.push(...result.warnings);
    }
  } catch (error) {
    // If fetching metadata fails entirely, fallback to parsing parameters from the input URL
    fields = parseAirbnbUrl(parsedUrl);
    warnings.push(
      error instanceof Error 
        ? `Airbnb metadata could not be fetched (${error.message}). URL parameters were still imported.`
        : "Airbnb metadata could not be fetched. URL parameters were still imported."
    );
  }

  return NextResponse.json({ fields, warnings });
}

function parseAirbnbUrl(parsedUrl: URL): ParsedAirbnbFields {
  const roomId = parsedUrl.pathname.match(/\/rooms\/([^/?#]+)/)?.[1];
  const adults = numberParam(parsedUrl, "adults");
  const children = numberParam(parsedUrl, "children");
  const checkIn = parsedUrl.searchParams.get("check_in") || parsedUrl.searchParams.get("checkin") || undefined;
  const checkOut = parsedUrl.searchParams.get("check_out") || parsedUrl.searchParams.get("checkout") || undefined;

  return {
    name: roomId ? `Airbnb ${roomId}` : undefined,
    airbnbUrl: parsedUrl.toString(),
    checkIn,
    checkOut,
    nights: checkIn && checkOut ? nightsBetween(checkIn, checkOut) : undefined,
    guests: adults + children || undefined,
    maxGuests: adults + children || undefined,
  };
}

async function fetchOpenGraph(url: string): Promise<{ fields: ParsedAirbnbFields; warnings?: string[] }> {
  const warnings: string[] = [];
  const response = await fetch(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "no-cache",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Airbnb returned ${response.status}`);
  }

  const finalUrl = new URL(response.url);
  const html = await response.text();

  // 1. Initial fields from redirected URL
  const fields = parseAirbnbUrl(finalUrl);

  // 2. Parse application/ld+json metadata (very structured and reliable)
  try {
    const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const data = JSON.parse(match[1]);
      if (data["@type"] === "VacationRental" || data["@type"] === "Product") {
        if (data.name) fields.name = clean(data.name);
        if (data.image && data.image.length > 0) fields.imageUrl = data.image[0];
        if (data.address && data.address.addressLocality) fields.location = clean(data.address.addressLocality);
        
        if (data.aggregateRating) {
          if (data.aggregateRating.ratingValue) fields.airbnbRating = Number(data.aggregateRating.ratingValue);
          if (data.aggregateRating.ratingCount) fields.reviewCount = Number(data.aggregateRating.ratingCount);
        }
        
        if (data.latitude && data.longitude) {
          fields.mapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
        }
        break;
      }
    }
  } catch {
    warnings.push("Failed to parse some structured LD+JSON metadata.");
  }

  // 3. Fallback to OpenGraph meta tags for missing fields
  const title = meta(html, "og:title") || html.match(/<title>(.*?)<\/title>/i)?.[1];
  const description = meta(html, "og:description");
  const imageUrl = meta(html, "og:image");
  const searchableText = `${title ?? ""} ${description ?? ""}`.toLowerCase();

  if (!fields.name) {
    fields.name = clean(description) || clean(title);
  }
  if (!fields.imageUrl && imageUrl) {
    fields.imageUrl = imageUrl;
  }

  // Facts from title (bedrooms, beds, bathrooms)
  const facts = parseTitleFacts(title);
  for (const [key, value] of Object.entries(facts)) {
    if (value !== undefined && value !== null && value !== "" && fields[key as keyof ParsedAirbnbFields] === undefined) {
      fields[key as keyof ParsedAirbnbFields] = value as never;
    }
  }

  // Pool and sea access amenities
  fields.pool = containsAny(searchableText, ["pool", "piscina", "schwimmbad"]);
  fields.seaAccess = containsAny(searchableText, ["beach", "sea", "meer", "strand", "plage"]);
  fields.directlyBySea = containsAny(searchableText, [
    "beachfront",
    "direkt am meer",
    "am strand",
    "by the sea",
  ]);

  if (!fields.shortVerdict && description) {
    fields.shortVerdict = clean(description);
  }

  return { fields, warnings };
}

function parseTitleFacts(title: string | undefined): ParsedAirbnbFields {
  if (!title) return {};

  const parts = decodeHtml(title)
    .split(" · ")
    .map((part) => part.trim())
    .filter(Boolean);
  const text = parts.join(" ");
  const rating = text.match(/★\s*([0-9]+(?:[,.][0-9]+)?)/)?.[1];

  // RegExes to extract rooms info
  const bedroomsMatch = text.match(/(\d+)\s*(?:schlafzimmer|bedroom)/i);
  const bedsMatch = text.match(/(\d+)\s*(?:betten|bett|beds|bed)/i);
  // Match bathrooms (including: 2 private Badezimmer, 1 shared bath, 1.5 bathrooms)
  const bathroomsMatch = text.match(/(\d+[\d,.]*)\s*(?:[a-zA-ZäöüÄÖÜß]+\s+)?(?:badezimmer|bathroom|bath|bäder|baths)/i);

  return {
    location: parts[1],
    airbnbRating: rating ? Number(rating.replace(",", ".")) : undefined,
    bedrooms: bedroomsMatch ? Number(bedroomsMatch[1]) : undefined,
    beds: bedsMatch ? Number(bedsMatch[1]) : undefined,
    bathrooms: bathroomsMatch ? Number(bathroomsMatch[1].replace(",", ".")) : undefined,
  };
}

function numberParam(url: URL, key: string) {
  const value = Number(url.searchParams.get(key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function nightsBetween(checkIn: string, checkOut: string) {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return undefined;
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function meta(html: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return undefined;
}

function containsAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word));
}

function clean(value: string | undefined) {
  if (!value) return undefined;
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
