import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      select: { code: true, name: true, city: true },
      orderBy: [{ city: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ districts });
  } catch (err) {
    console.error("[GET /api/districts]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
