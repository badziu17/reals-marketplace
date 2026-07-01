import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/listings/[id]
 * Zwraca pojedynczą ofertę z dzielnicą.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { district: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Oferta nie istnieje." }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("[GET /api/listings/[id]]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
