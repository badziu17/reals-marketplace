import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

// GET: lista rozmów zalogowanego użytkownika, z podglądem ostatniej
// wiadomości i licznikiem nieprzeczytanych (patrz ConversationParticipant.lastReadAt).
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ conversations: [] });

  const rows = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          listing: { include: { district: true } },
          participants: { include: { user: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  const conversations = await Promise.all(
    rows.map(async (row: any) => {
      const conv = row.conversation;
      const other = conv.participants.find((p: any) => p.userId !== userId)?.user ?? null;
      const lastMessage = conv.messages[0] ?? null;
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          ...(row.lastReadAt ? { createdAt: { gt: row.lastReadAt } } : {}),
        },
      });
      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        listing: conv.listing,
        otherUser: other ? { id: other.id, name: other.name, image: other.image } : null,
        lastMessage,
        unreadCount,
      };
    })
  );

  return NextResponse.json({ conversations });
}

// POST: znajdź albo załóż rozmowę z właścicielem danego ogłoszenia.
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Zaloguj się, żeby napisać wiadomość." }, { status: 401 });
  }

  try {
    const { listingId } = await req.json();
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!listing || !listing.ownerId) {
      return NextResponse.json(
        { error: "Ta oferta nie ma jeszcze prawdziwego kontaktu (dane demo, nie prawdziwy właściciel)." },
        { status: 400 }
      );
    }
    if (listing.ownerId === userId) {
      return NextResponse.json({ error: "To Twoje własne ogłoszenie." }, { status: 400 });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        listingId: listing.id,
        AND: [{ participants: { some: { userId } } }, { participants: { some: { userId: listing.ownerId } } }],
      },
    });
    if (existing) return NextResponse.json({ conversationId: existing.id });

    const conv = await prisma.conversation.create({
      data: {
        listingId: listing.id,
        participants: { create: [{ userId }, { userId: listing.ownerId }] },
      },
    });

    return NextResponse.json({ conversationId: conv.id });
  } catch (err) {
    console.error("[POST /api/conversations]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
