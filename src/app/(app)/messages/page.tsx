import { MessagesClient } from "@/components/messages/MessagesClient";

// Iteracja 13: komunikator (wątki + okno rozmowy + szablony + polling).
// `c` (id aktywnej rozmowy) czytany po stronie serwera z prawdziwego
// searchParams — ten sam, sprawdzony wzorzec co initialSelectedId w
// /search (unika błędu hydratacji, patrz historia iteracji 6-7).
export default function MessagesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const c = searchParams.c;
  const initialConversationId = typeof c === "string" ? c : null;

  return <MessagesClient initialConversationId={initialConversationId} />;
}
