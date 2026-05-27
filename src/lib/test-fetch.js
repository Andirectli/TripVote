/* global console */

const testTitles = [
  "Privatunterkunft · Castiglione di Garfagnana · ★4,7 · 3 Schlafzimmer · 3 Betten · 2 private Badezimmer",
  "Home in Castiglione · ★4.7 · 3 bedrooms · 3 beds · 2 baths",
  "Villa in Florence · ★4.9 · 5 bedrooms · 8 beds · 4.5 bathrooms",
  "Condo · ★4.5 · 1 bedroom · 1 bed · 1 shared bath"
];

function testRegex(title) {
  const text = title.split(" · ").join(" ");
  
  const bathroomsMatch = text.match(/(\d+[\d,.]*)\s*(?:[a-zA-ZäöüÄÖÜß]+\s+)?(?:badezimmer|bathroom|bath|bäder|baths)/i);
  const bathrooms = bathroomsMatch ? Number(bathroomsMatch[1].replace(",", ".")) : undefined;
  console.log(`Title: "${title}" => bathrooms:`, bathrooms);
}

testTitles.forEach(testRegex);
