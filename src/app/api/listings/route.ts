import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q");
    const type = searchParams.get("type");
    const priceMax = searchParams.get("priceMax");
    const rentMax = searchParams.get("rentMax");
    const roomsParam = searchParams.get("rooms");
    const areaMin = searchParams.get("areaMin");
    const market = searchParams.get("market");
    const amenitiesParam = searchParams.get("amenities");
    const onlyFair = searchParams.get("onlyFair") === "true";
    const district = searchParams.get("district");
    const featured = searchParams.get("featured") === "true";
    const sort = searchParams.get("sort") ?? "foryou";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, unknown> = { status: "PUBLISHED" };

    if (type === "KUP" || type === "WYNAJEM") where.type = type;

    if (type === "WYNAJEM" && rentMax) {
      where.price = { lte: parseInt(rentMax) };
    } else if (priceMax) {
      where.price = { lte: parseInt(priceMax) };
    }

    if (roomsParam) {
      const rooms = roomsParam.split(",").map(Number).filter(Boolean);
      if (rooms.length > 0) where.rooms = { in: rooms };
    }

    if (areaMin) where.area = { gte: parseFloat(areaMin) };
    if (market === "PIERWOTNY" || market === "WTORNY") where.market = market;

    if (amenitiesParam) {
      const amenities = amenitiesParam.split(",").filter(Boolean);
      if (amenities.length > 0) where.amenities = { hasEvery: amenities };
    }

    if (district) where.districtCode = district;
    if (featured) where.featured = true;
    if (q && q.trim()) {
      where.district = { name: { contains: q.trim(), mode: "insensitive" } };
    }

    let orderBy: Record<string, string> = { quality: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "area_desc") orderBy = { area: "desc" };
    if (sort === "fresh") orderBy = { fresh: "desc" };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: { district: true },
      }),
      prisma.listing.count({ where }),
    ]);

    const result = onlyFair
      ? listings.filter(
          (l: { avmLow: number | null; avmHigh: number | null; price: number }) =>
            l.avmLow != null &&
            l.avmHigh != null &&
            l.price >= l.avmLow &&
            l.price <= l.avmHigh
        )
      : listings;

    return NextResponse.json({ listings: result, total, limit, offset });
  } catch (err) {
    console.error("[GET /api/listings]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
