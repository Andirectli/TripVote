import type { Accommodation, TripState, Voter } from "@/lib/types";

const airbnbUrls = [
  "https://www.airbnb.de/rooms/2506051?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364628591&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P3PQmKcu_OXDT4Bs&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/27454039?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364624666&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P3ONXsEq0LUSnchT&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/1314977785565202106?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364620807&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P3Dji9ZlB6Pe7Sw_&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/26592868?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364337859&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P39M5J586C1DTBjI&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/7570735?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364335640&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P3CMdV_sxNKaLvKE&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/18343225?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364156059&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P3WPmVYwb4chgdgv&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/1682088821426260719?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364152410&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P389cUd2dPVKX8dC&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/1484255110698772007?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364137724&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P3N7tlMpkc0atMVC&previous_page_section_name=1000",
  "https://www.airbnb.de/rooms/7065944?adults=6&children=0&infants=0&pets=0&wishlist_item_id=11006364038087&check_in=2026-08-24&check_out=2026-08-30&source_impression_id=p3_1779816520_P3BvO4hUSWhiLjy5&previous_page_section_name=1000",
];

const placeholderImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80",
];

function roomIdFromUrl(url: string) {
  return url.match(/\/rooms\/([^/?#]+)/)?.[1] ?? crypto.randomUUID();
}

function createSeedAccommodation(url: string, index: number): Accommodation {
  const roomId = roomIdFromUrl(url);

  return {
    id: `airbnb-${roomId}`,
    name: `Airbnb ${roomId}`,
    location: "",
    countryRegion: "",
    airbnbUrl: url,
    mapsUrl: "",
    imageUrl: placeholderImages[index % placeholderImages.length],
    checkIn: "2026-08-24",
    checkOut: "2026-08-30",
    nights: 6,
    guests: 6,
    totalPrice: null,
    bedrooms: null,
    bathrooms: null,
    beds: null,
    maxGuests: null,
    pool: false,
    seaAccess: false,
    directlyBySea: false,
    gardenTerrace: false,
    parking: false,
    airConditioning: false,
    kitchen: false,
    washingMachine: false,
    nearestAirport: "",
    airportDistanceKm: null,
    airportDriveTime: "",
    flightOrigin: "Düsseldorf / Köln",
    flightDestinationAirport: "",
    flightDuration: "",
    flightPrice: null,
    cheapestNearbyOrigin: "",
    flightNotes: "",
    availabilityStatus: "unknown",
    lastAvailabilityCheckAt: null,
    reservationCostStatus: "unknown",
    airbnbRating: null,
    reviewCount: null,
    pros: "",
    cons: "",
    overallScore: null,
    status: "New",
    shortVerdict: "",
    notes: "",
  };
}

const seedVoters: Voter[] = Array.from({ length: 6 }, (_, index) => ({
  id: `voter-${index + 1}`,
  name: `Person ${index + 1}`,
  active: true,
}));

export const seedState: TripState = {
  accommodations: airbnbUrls.map(createSeedAccommodation),
  voters: seedVoters,
  votes: [],
  updatedAt: new Date().toISOString(),
  tripDetails: {
    guests: 6,
    checkIn: "2026-08-24",
    checkOut: "2026-08-30",
    destination: "quiet beach locations",
    origins: "Düsseldorf, Köln or nearby",
    coverImageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2000&q=80",
  },
};
