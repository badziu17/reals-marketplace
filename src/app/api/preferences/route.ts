import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ preferences: null });

  const preferences = await prisma.userPreferences.findUnique({ where: { userId } });
  return NextResponse.json({ preferences });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const areas: string[] = Array.isArray(body.areas) ? body.areas : [];
    const budget: number | null = typeof body.budget === "number" ? body.budget : null;
    const rooms: number[] = Array.isArray(body.rooms) ? body.rooms : [];
    const musts: string[] = Array.isArray(body.musts) ? body.musts : [];

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      // Gość bez konta: preferencje i tak działają jako filtry od razu
      // (patrz OnboardingWizard), po prostu nie ma ich gdzie trwale zapisać.
      // To NIE powinno blokować flow onboardingu.
      return NextResponse.json({ saved: false });
    }

    await prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, areas, budget, rooms, musts },
      update: { areas, budget, rooms, musts },
    });

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("[POST /api/preferences]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
