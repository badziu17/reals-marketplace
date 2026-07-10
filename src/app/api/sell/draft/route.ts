import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAvmRange } from "@/lib/domain";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

// GET: draft w edycji (jeśli jest) + wszystkie ogłoszenia usera (dowolny
// status) — to drugie zasila panel "Twoje ogłoszenia" na stronie Sell
// (kryterium iteracji 11: "widoczne na koncie").
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ draft: null, myListings: [] });

  const [draft, myListings] = await Promise.all([
    prisma.listing.findFirst({
      where: { ownerId: userId, status: "DRAFT" },
      include: { district: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.listing.findMany({
      where: { ownerId: userId },
      include: { district: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ draft, myListings });
}

interface DraftBody {
  districtCode?: string;
  type?: "KUP" | "WYNAJEM";
  market?: "PIERWOTNY" | "WTORNY";
  rooms?: number;
  area?: number;
  floor?: number | null;
  year?: number | null;
  price?: number;
  amenities?: string[];
  gradient?: string;
  description?: string;
  photos?: string[];
  floorPlan?: string | null;
  publish?: boolean;
}

const REQUIRED_KEYS = ["districtCode", "type", "market", "rooms", "area", "price"] as const;

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Zaloguj się, żeby wystawić ogłoszenie." }, { status: 401 });
  }

  try {
    const body: DraftBody = await req.json();

    // Auto-save działa od pierwszej chwili w UI, ale zapis do bazy ma sens
    // dopiero gdy komplet pól wymaganych przez model (NOT NULL bez default)
    // jest obecny — inaczej Prisma i tak odrzuci create().
    const hasRequired = REQUIRED_KEYS.every((k) => {
      const v = body[k];
      return v !== undefined && v !== null && v !== ("" as unknown);
    });
    if (!hasRequired) {
      return NextResponse.json({ saved: false, reason: "incomplete" });
    }

    const existing = await prisma.listing.findFirst({
      where: { ownerId: userId, status: "DRAFT" },
    });

    const data: Record<string, unknown> = {
      districtCode: body.districtCode,
      type: body.type,
      market: body.market,
      rooms: body.rooms,
      area: body.area,
      floor: body.floor ?? null,
      year: body.year ?? null,
      price: body.price,
      amenities: body.amenities ?? [],
      gradient: body.gradient ?? null,
      description: body.description ?? null,
      photos: body.photos ?? [],
      floorPlan: body.floorPlan ?? null,
    };

    if (body.publish) {
      const district = await prisma.district.findUnique({ where: { code: body.districtCode } });
      const { avmLow, avmHigh } = district
        ? computeAvmRange(district.fairPrice, body.area as number, body.type as "KUP" | "WYNAJEM")
        : { avmLow: null, avmHigh: null };
      data.status = "PUBLISHED";
      data.avmLow = avmLow;
      data.avmHigh = avmHigh;
      data.sources = ["Ogłoszenie własne"];
      data.fresh = new Date();
    }

    const listing = existing
      ? await prisma.listing.update({ where: { id: existing.id }, data: data as any })
      : await prisma.listing.create({
          data: { ...data, ownerId: userId } as any,
        });

    return NextResponse.json({ saved: true, listing });
  } catch (err) {
    console.error("[POST /api/sell/draft]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
