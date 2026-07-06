import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { district: true },
    });

    if (!listing || listing.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Nie znaleziono oferty." }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("[GET /api/listings/[id]]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
