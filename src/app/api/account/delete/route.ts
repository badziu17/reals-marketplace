import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE: anonimizuje konto (RODO art. 17 — prawo do bycia zapomnianym).
//
// Nie usuwamy wiersza User fizycznie — Message.sender i Listing.owner
// odwołują się do niego przez klucz obcy, a inni uczestnicy rozmów mają
// prawo zachować historię swojej korespondencji. Zamiast tego:
//  1. kasujemy kaskadowo dane czysto osobiste (konta OAuth, sesje, preferencje, zapisane oferty),
//  2. archiwizujemy własne ogłoszenia (nie da się nimi już zarządzać),
//  3. anonimizujemy sam wiersz User (e-mail/nazwa/zdjęcie/hasło wyczyszczone, deletedAt ustawiony).
//
// UWAGA: sesja NextAuth działa w trybie JWT (bezstanowa) — usunięcie wierszy
// Session w bazie NIE wylogowuje użytkownika samo w sobie. Klient musi po
// udanej odpowiedzi wywołać signOut(), żeby realnie wyczyścić ciasteczko
// (patrz AccountSettings.tsx).
export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  try {
    await prisma.$transaction([
      prisma.account.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.userPreferences.deleteMany({ where: { userId } }),
      prisma.savedListing.deleteMany({ where: { userId } }),
      prisma.listing.updateMany({ where: { ownerId: userId }, data: { status: "ARCHIVED" } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          email: `usuniety-${userId}@reals.local`,
          name: null,
          image: null,
          passwordHash: null,
          deletedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/account/delete]", err);
    return NextResponse.json({ error: "Błąd serwera. Spróbuj ponownie." }, { status: 500 });
  }
}
