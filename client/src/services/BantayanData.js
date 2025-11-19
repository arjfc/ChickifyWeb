// src/constants/bantayanData.js

// Small helpers
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, " ")
    .trim();

const r5 = (n) => Math.round(n * 1e5) / 1e5;

// Main data
export const municipalities = [
  {
    name: "Bantayan",
    classification: "Second Class Municipality",
    zipcode: "6052",
    coords: {
      // ~ Bantayan town (centroid-ish)
      lat: 11.16400, // approximate
      lon: 123.72800, // approximate
    },
    barangays: [
      { name: "Atop-atop" },
      { name: "Baigad" },
      { name: "Baod" },
      { name: "Binaobao (Poblacion)" },
      { name: "Balidbid" },
      { name: "Kabac" },
      { name: "Doong" },
      { name: "Hilotongan" },
      { name: "Guiwanon" },
      { name: "Kabangbang" },
      { name: "Kampingganon" },
      { name: "Kangkaibe" },
      { name: "Lipayran" },
      { name: "Luyongbaybay" },
      { name: "Mojon" },
      { name: "Obo-ob" },
      { name: "Patao" },
      { name: "Putian" },
      { name: "Sillon" },
      { name: "Sungko" },
      { name: "Suba (Poblacion)" },
      { name: "Sulangan" },
      { name: "Tamiao" },
      { name: "Bantigue (Poblacion)" },
      { name: "Ticad (Poblacion)" },
    ],
  },
  {
    name: "Madridejos",
    classification: "Fourth Class Municipality",
    zipcode: "6053",
    coords: {
      // ~ Madridejos (north tip)
      lat: 11.29600, // approximate
      lon: 123.73300, // approximate
    },
    barangays: [
      { name: "Bunakan" },
      { name: "Kangwayan" },
      { name: "Kaongkod" },
      { name: "Kodia" },
      { name: "Maalat" },
      { name: "Malbago" },
      { name: "Mancilang" },
      { name: "Pili" },
      { name: "Poblacion" },
      { name: "San Agustin" },
      { name: "Tabagak" },
      { name: "Talangnan" },
      { name: "Tarong" },
      { name: "Tugas" },
    ],
  },
  {
    name: "Santa Fe",
    classification: "Fifth Class Municipality",
    zipcode: "6047",
    coords: {
      // ~ Santa Fe (SE coastline)
      lat: 11.15900, // approximate
      lon: 123.81000, // approximate
    },
    barangays: [
      { name: "Hagdan" },
      { name: "Hilantagaan" },
      { name: "Kinatarkan" }, // island barangay of Santa Fe
      { name: "Langub" },
      { name: "Maricaban" },
      { name: "Okoy" },
      { name: "Poblacion" },
      { name: "Balidbid" },
      { name: "Pooc" },
      { name: "Talisay" },
    ],
  },
];

/** Look up a municipality by name (case/spacing/diacritics insensitive) */
export function findMunicipality(name) {
  const target = norm(name);
  return municipalities.find((m) => norm(m.name) === target);
}

/** Look up a barangay by muni + brgy name (insensitive) */
export function findBarangay(municipalityName, barangayName) {
  const muni = findMunicipality(municipalityName);
  if (!muni) return undefined;

  const target = norm(barangayName);
  const brgy =
    muni.barangays.find((b) => norm(b.name) === target) ??
    muni.barangays.find((b) => norm(b.name).includes(target)) ??
    undefined;

  if (!brgy) return undefined;
  return { municipality: muni, barangay: brgy };
}

/** Get the municipality ZIP. */
export function getZip(municipalityName) {
  const muni = findMunicipality(municipalityName);
  return muni ? muni.zipcode : null;
}

/**
 * Get coords for a municipality or a specific barangay.
 * If barangay has no own coords, falls back to the municipality centroid.
 * Always returns values rounded to 5 decimal places.
 */
export function getLatLon(municipalityName, barangayName) {
  if (!barangayName) {
    const muni = findMunicipality(municipalityName);
    return muni
      ? { lat: r5(muni.coords.lat), lon: r5(muni.coords.lon) }
      : null;
  }

  const hit = findBarangay(municipalityName, barangayName);
  if (!hit) return null;

  const { municipality, barangay } = hit;
  const lat = barangay.lat ?? municipality.coords.lat;
  const lon = barangay.lon ?? municipality.coords.lon;
  if (typeof lat === "number" && typeof lon === "number") {
    return { lat: r5(lat), lon: r5(lon) };
  }
  return null;
}
