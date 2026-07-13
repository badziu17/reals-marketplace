import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

async function assertParticipant(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

// GET: wiadomości w wątku. `?after=ISO` — tylko nowsze niż podany czas,
// używane przez polling (żeby nie ściągać całej historii co kilka sekund).
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  const participant = await assertParticipant(params.id, userId);
  if (!participant) return NextResponse.json({ error: "Brak dostępu do tej rozmowy." }, { status: 403 });

  const after = new URL(req.url).searchParams.get("after");

  const messages = await prisma.message.findMany({
    where: {
      conversationId: params.id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ messages });
}

const VALID_KINDS = ["TEXT", "VIEWING", "ATTACHMENT"];

// POST: wyślij wiadomość (tekst / propozycja oglądania / załącznik jako data URL).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  const participant = await assertParticipant(params.id, userId);
  if (!participant) return NextResponse.json({ error: "Brak dostępu do tej rozmowy." }, { status: 403 });

  try {
    const body = await req.json();
    const text: string = typeof body.body === "string" ? body.body.trim() : "";
    const kind = VALID_KINDS.includes(body.kind) ? body.kind : "TEXT";

    if (!text) return NextResponse.json({ error: "Pusta wiadomość." }, { status: 400 });

    const message = await prisma.message.create({
      data: { conversationId: params.id, senderId: userId, body: text, kind },
      include: { sender: { select: { id: true, name: true, image: true } } },
    });

    await prisma.conversation.update({ where: { id: params.id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[POST /api/conversations/[id]/messages]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
