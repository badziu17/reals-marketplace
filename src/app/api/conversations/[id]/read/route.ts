import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: oznacz rozmowę jako przeczytaną (ustawia lastReadAt dla mojego
// wiersza ConversationParticipant) — wywoływane przy otwarciu wątku.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId: params.id, userId },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
