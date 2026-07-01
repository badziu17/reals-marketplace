/**
 * Seed danych REALS — iteracja 3.
 * Dane 1:1 z prototypu (REALS.dc.html): 14 dzielnic, 21 ofert.
 * Uruchom: npm run prisma:seed
 */

import { PrismaClient } from "@prisma/client";
import { computeQuality } from "../src/lib/domain";

type MarketType = "PIERWOTNY" | "WTORNY";
type OfferType = "KUP" | "WYNAJEM";
type ListingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const prisma = new PrismaClient();

// Gradienty z prototypu (cyklicznie po gi % 9)
const GRAD = [
  "#C8553D-#9e3f2c",
  "#5E7A60-#3a4f3c",
  "#B98A2E-#7a5a18",
  "#6E8CA0-#3f5566",
  "#A05C4A-#6b3a2c",
  "#5B7E78-#33504b",
  "#8A7B5C-#564a32",
  "#7A6A8C-#473c54",
  "#4F7A6A-#2c483e",
];

// Dni świeżości z prototypu (cyklicznie po gi % 8)
const FRESH_DAYS = [1, 2, 3, 5, 6, 8, 11, 14];

function freshDate(gi: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - FRESH_DAYS[gi % 8]);
  return d;
}

// ---------- Dzielnice (DIST z prototypu) ----------
const DISTRICTS = [
  { code: "gdynia-oksywie",       name: "Gdynia Oksywie",        city: "GDYNIA" as const, cx: 158, cy: 58,  fairPrice: 9800,  commute: "38", noise: "Cicho",   schools: 3 },
  { code: "gdynia-cisowa",        name: "Gdynia Cisowa",          city: "GDYNIA" as const, cx: 92,  cy: 92,  fairPrice: 8600,  commute: "42", noise: "Cicho",   schools: 3 },
  { code: "gdynia-srodmiescie",   name: "Gdynia Śródmieście",     city: "GDYNIA" as const, cx: 188, cy: 112, fairPrice: 14900, commute: "30", noise: "Średnio", schools: 4 },
  { code: "gdynia-dzialki-lesne", name: "Gdynia Działki Leśne",   city: "GDYNIA" as const, cx: 150, cy: 132, fairPrice: 13600, commute: "31", noise: "Średnio", schools: 4 },
  { code: "gdynia-orlowo",        name: "Gdynia Orłowo",          city: "GDYNIA" as const, cx: 232, cy: 178, fairPrice: 18200, commute: "28", noise: "Cicho",   schools: 5 },
  { code: "sopot",                name: "Sopot",                  city: "SOPOT"  as const, cx: 224, cy: 252, fairPrice: 23500, commute: "22", noise: "Średnio", schools: 5 },
  { code: "gdansk-zabianka",      name: "Gdańsk Żabianka",        city: "GDANSK" as const, cx: 236, cy: 300, fairPrice: 17400, commute: "20", noise: "Cicho",   schools: 5 },
  { code: "gdansk-oliwa",         name: "Gdańsk Oliwa",           city: "GDANSK" as const, cx: 188, cy: 318, fairPrice: 16900, commute: "18", noise: "Cicho",   schools: 5 },
  { code: "gdansk-przymorze",     name: "Gdańsk Przymorze",       city: "GDANSK" as const, cx: 242, cy: 342, fairPrice: 16300, commute: "19", noise: "Średnio", schools: 4 },
  { code: "gdansk-wrzeszcz",      name: "Gdańsk Wrzeszcz",        city: "GDANSK" as const, cx: 196, cy: 384, fairPrice: 15600, commute: "12", noise: "Głośno",  schools: 4 },
  { code: "gdansk-nowy-port",     name: "Gdańsk Nowy Port",       city: "GDANSK" as const, cx: 246, cy: 416, fairPrice: 10400, commute: "24", noise: "Średnio", schools: 3 },
  { code: "gdansk-srodmiescie",   name: "Gdańsk Śródmieście",     city: "GDANSK" as const, cx: 210, cy: 462, fairPrice: 17800, commute: "4",  noise: "Głośno",  schools: 4 },
  { code: "gdansk-jasien",        name: "Gdańsk Jasień",          city: "GDANSK" as const, cx: 120, cy: 470, fairPrice: 13900, commute: "22", noise: "Cicho",   schools: 4 },
  { code: "gdansk-orunia",        name: "Gdańsk Orunia",          city: "GDANSK" as const, cx: 176, cy: 526, fairPrice: 11200, commute: "16", noise: "Średnio", schools: 3 },
];

// ---------- Oferty raw (z prototypu) ----------
interface RawListing {
  districtCode: string;
  rooms: number;
  area: number;
  floor: number;
  year: number;
  market: MarketType;
  type: OfferType;
  price: number;
  amenities: string[];
  sources: string[];
  gi: number; // gradient index
  featured: boolean;
}

const RAW: RawListing[] = [
  { districtCode: "gdansk-wrzeszcz",      rooms: 3, area: 58,  floor: 3, year: 2019, market: "WTORNY",    type: "KUP",     price: 720000,  amenities: ["balkon","parking"],                   sources: ["Maxnieruchomości","Trójmiasto Estate","Home Points","Górski"], gi: 0,  featured: true  },
  { districtCode: "gdansk-oliwa",          rooms: 3, area: 73,  floor: 0, year: 2019, market: "WTORNY",    type: "KUP",     price: 1649000, amenities: ["ogródek","parking"],                  sources: ["EstiHome"],                                                    gi: 1,  featured: true  },
  { districtCode: "gdansk-przymorze",      rooms: 2, area: 46,  floor: 5, year: 2024, market: "PIERWOTNY", type: "KUP",     price: 690000,  amenities: ["balkon"],                             sources: ["Inpro Deweloper"],                                             gi: 2,  featured: true  },
  { districtCode: "gdansk-zabianka",       rooms: 4, area: 92,  floor: 7, year: 2022, market: "WTORNY",    type: "KUP",     price: 1790000, amenities: ["balkon","parking","winda"],            sources: ["Trójmiasto Estate","Lokum"],                                   gi: 3,  featured: true  },
  { districtCode: "gdansk-jasien",         rooms: 4, area: 110, floor: 2, year: 2025, market: "PIERWOTNY", type: "KUP",     price: 1639000, amenities: ["ogródek","balkon"],                   sources: ["Robyg","EstiHome","Domesta"],                                  gi: 4,  featured: true  },
  { districtCode: "gdansk-srodmiescie",    rooms: 2, area: 52,  floor: 4, year: 1998, market: "WTORNY",    type: "KUP",     price: 985000,  amenities: ["balkon"],                             sources: ["Home Points"],                                                 gi: 5,  featured: true  },
  { districtCode: "gdansk-orunia",         rooms: 2, area: 48,  floor: 1, year: 2013, market: "WTORNY",    type: "KUP",     price: 549000,  amenities: ["parking"],                            sources: ["Pomorskie Domy"],                                              gi: 6,  featured: false },
  { districtCode: "gdansk-nowy-port",      rooms: 3, area: 64,  floor: 2, year: 2008, market: "WTORNY",    type: "KUP",     price: 615000,  amenities: [],                                     sources: ["Trevo Nieruchomości"],                                         gi: 7,  featured: false },
  { districtCode: "sopot",                 rooms: 2, area: 49,  floor: 3, year: 2017, market: "WTORNY",    type: "KUP",     price: 1290000, amenities: ["balkon","winda"],                      sources: ["Sopot Premium","EstiHome"],                                    gi: 8,  featured: false },
  { districtCode: "gdynia-orlowo",         rooms: 3, area: 70,  floor: 2, year: 2023, market: "PIERWOTNY", type: "KUP",     price: 1380000, amenities: ["balkon","parking","winda"],            sources: ["Górski"],                                                      gi: 9,  featured: false },
  { districtCode: "gdynia-srodmiescie",    rooms: 2, area: 45,  floor: 1, year: 2025, market: "PIERWOTNY", type: "KUP",     price: 931000,  amenities: ["balkon"],                             sources: ["Budros","Górski"],                                             gi: 10, featured: false },
  { districtCode: "gdynia-dzialki-lesne",  rooms: 3, area: 66,  floor: 4, year: 2010, market: "WTORNY",    type: "KUP",     price: 829000,  amenities: ["balkon"],                             sources: ["Pomorskie Domy"],                                              gi: 11, featured: false },
  { districtCode: "gdynia-oksywie",        rooms: 3, area: 67,  floor: 1, year: 2025, market: "PIERWOTNY", type: "KUP",     price: 642000,  amenities: ["balkon","ogródek"],                   sources: ["AMProjekt"],                                                   gi: 12, featured: false },
  { districtCode: "gdynia-cisowa",         rooms: 2, area: 50,  floor: 2, year: 2006, market: "WTORNY",    type: "KUP",     price: 459000,  amenities: [],                                     sources: ["Trevo Nieruchomości"],                                         gi: 13, featured: false },
  { districtCode: "gdansk-wrzeszcz",       rooms: 1, area: 31,  floor: 1, year: 2026, market: "PIERWOTNY", type: "KUP",     price: 540000,  amenities: ["balkon"],                             sources: ["Wrzeszcz Invest"],                                             gi: 14, featured: false },
  { districtCode: "gdansk-oliwa",          rooms: 4, area: 96,  floor: 3, year: 2021, market: "WTORNY",    type: "KUP",     price: 2150000, amenities: ["balkon","parking","winda","ogródek"],  sources: ["Sopot Premium"],                                               gi: 15, featured: false },
  { districtCode: "gdansk-wrzeszcz",       rooms: 2, area: 44,  floor: 2, year: 2018, market: "WTORNY",    type: "WYNAJEM", price: 3600,    amenities: ["balkon"],                             sources: ["Home Points"],                                                 gi: 16, featured: false },
  { districtCode: "gdansk-srodmiescie",    rooms: 1, area: 30,  floor: 5, year: 2015, market: "WTORNY",    type: "WYNAJEM", price: 2750,    amenities: ["winda"],                              sources: ["Trójmiasto Estate"],                                           gi: 17, featured: false },
  { districtCode: "sopot",                 rooms: 2, area: 52,  floor: 1, year: 2019, market: "WTORNY",    type: "WYNAJEM", price: 4500,    amenities: ["balkon","ogródek"],                   sources: ["Sopot Premium"],                                               gi: 18, featured: false },
  { districtCode: "gdynia-srodmiescie",    rooms: 3, area: 64,  floor: 4, year: 2020, market: "WTORNY",    type: "WYNAJEM", price: 4200,    amenities: ["balkon","parking"],                   sources: ["Górski"],                                                      gi: 19, featured: false },
  { districtCode: "gdansk-przymorze",      rooms: 2, area: 47,  floor: 6, year: 2022, market: "PIERWOTNY", type: "WYNAJEM", price: 3900,    amenities: ["balkon"],                             sources: ["Inpro Deweloper"],                                             gi: 20, featured: false },
];

async function main() {
  console.log("🌱 Seedowanie bazy danych REALS...");

  // Wyczyść istniejące dane (w odwrotnej kolejności zależności)
  await prisma.listing.deleteMany();
  await prisma.district.deleteMany();

  // Upsert dzielnic
  console.log(`  → ${DISTRICTS.length} dzielnic...`);
  for (const d of DISTRICTS) {
    await prisma.district.upsert({
      where: { code: d.code },
      update: d,
      create: { ...d, lat: null, lng: null },
    });
  }

  // Utwórz oferty
  console.log(`  → ${RAW.length} ofert...`);
  const distMap = new Map(DISTRICTS.map((d) => [d.code, d]));

  for (const r of RAW) {
    const dist = distMap.get(r.districtCode)!;
    const fairTotal = dist.fairPrice * r.area;
    const fresh = freshDate(r.gi);

    await prisma.listing.create({
      data: {
        districtCode: r.districtCode,
        rooms: r.rooms,
        area: r.area,
        floor: r.floor,
        year: r.year,
        market: r.market,
        type: r.type,
        price: r.price,
        amenities: r.amenities,
        sources: r.sources,
        avmLow: r.type === "KUP" ? Math.round(fairTotal * 0.94) : null,
        avmHigh: r.type === "KUP" ? Math.round(fairTotal * 1.06) : null,
        fresh,
        gradient: GRAD[r.gi % GRAD.length],
        quality: computeQuality({ amenities: r.amenities, sources: r.sources, year: r.year, fresh }),
        featured: r.featured,
        status: "PUBLISHED" as ListingStatus,
      },
    });
  }

  console.log("✅ Seed zakończony.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
