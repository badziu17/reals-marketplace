import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: eksport wszystkich danych osobowych zalogowanego użytkownika jako
// plik JSON do pobrania (RODO art. 15 — prawo dostępu, art. 20 — przenoszenie
// danych). Patrz też /account (UI) i /api/account/delete (prawo do usunięcia).
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  const [user, preferences, savedListings, ownListings, participations, sentMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    }),
    prisma.userPreferences.findUnique({ where: { userId } }),
    prisma.savedListing.findMany({
      where: { userId },
      include: { listing: { select: { id: true, price: true, districtCode: true, rooms: true, area: true } } },
    }),
    prisma.listing.findMany({ where: { ownerId: userId } }),
    prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    }),
    prisma.message.findMany({
      where: { senderId: userId },
      select: { id: true, conversationId: true, body: true, kind: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profil: user,
    preferencje: preferences,
    zapisaneOferty: savedListings,
    wlasneOgloszenia: ownListings,
    rozmowy: participations,
    wyslaneWiadomosci: sentMessages,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="reals-moje-dane.json"',
    },
  });
}
