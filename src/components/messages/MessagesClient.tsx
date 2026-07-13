"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ThreadWindow } from "./ThreadWindow";
import { formatPrice } from "@/lib/domain";

export interface ConversationSummary {
  id: string;
  updatedAt: string;
  listing: {
    id: string;
    price: number;
    type: string;
    ownerId: string | null;
    gradient: string | null;
    photos: string[];
    district: { name: string };
  } | null;
  otherUser: { id: string; name: string | null; image: string | null } | null;
  lastMessage: { body: string; kind: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
}

const LIST_POLL_MS = 5000;

interface MessagesClientProps {
  initialConversationId: string | null;
}

export function MessagesClient({ initialConversationId }: MessagesClientProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId);
  const [loaded, setLoaded] = useState(false);

  const fetchList = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchList();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchList();
    }, LIST_POLL_MS);
    return () => clearInterval(interval);
  }, [status, fetchList]);

  function openConversation(id: string) {
    setActiveId(id);
    router.replace(`${pathname}?c=${id}`, { scroll: false });
  }

  function closeConversation() {
    setActiveId(null);
    router.replace(pathname, { scroll: false });
  }

  const active = conversations.find((c) => c.id === activeId) ?? null;

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-[500px] px-[22px] py-16 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-ink">Wiadomości</h1>
        <p className="mb-5 text-sm text-ink-muted">Musisz być zalogowany, żeby zobaczyć swoje rozmowy.</p>
        <Link
          href="/login"
          className="inline-block rounded-pill bg-terracotta px-6 py-3 text-sm font-bold text-white"
        >
          Zaloguj się
        </Link>
      </main>
    );
  }

  return (
    <div className="flex" style={{ height: "calc(100vh - 57px)" }}>
      {/* Lista rozmów — ukryta na mobile, gdy wątek jest otwarty */}
      <aside
        className={`w-full shrink-0 overflow-y-auto border-r border-line bg-card sm:w-[320px] ${
          active ? "hidden sm:block" : "block"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
          <span className="font-display text-xl font-bold text-ink">Wiadomości</span>
          <span className="font-mono text-[11px] text-ink-faint">
            {conversations.length} {conversations.length === 1 ? "rozmowa" : "rozmowy"}
          </span>
        </div>

        {loaded && conversations.length === 0 ? (
          <div className="grid place-items-center px-8 py-16 text-center text-ink-faint">
            <div>
              <div className="text-4xl">💬</div>
              <p className="mt-3.5 font-bold text-ink-muted">Twoja skrzynka</p>
              <p className="mt-1 max-w-[280px] text-[13px]">
                Napisz do właściciela ogłoszenia z jego Detailu — rozmowa pojawi się tutaj.
              </p>
            </div>
          </div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`flex w-full items-center gap-3 border-b border-line-soft px-4 py-3.5 text-left transition hover:bg-bg-app ${
                activeId === c.id ? "bg-bg-app" : ""
              }`}
            >
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-pill bg-terracotta font-extrabold text-white">
                {(c.otherUser?.name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="truncate text-sm font-bold text-ink">{c.otherUser?.name ?? "Użytkownik"}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-ink-faint">{relativeTime(c.updatedAt)}</span>
                </div>
                {c.listing && (
                  <div className="truncate text-[11.5px] font-semibold text-ink-faint">
                    {formatPrice(c.listing.price)} zł · {c.listing.district.name}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="min-w-0 flex-1 truncate text-xs text-ink-muted">{previewText(c.lastMessage)}</span>
                  {c.unreadCount > 0 && (
                    <span className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-pill bg-terracotta px-1 text-[10.5px] font-extrabold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </aside>

      {/* Wątek */}
      <section className={`flex-1 ${active ? "block" : "hidden sm:block"}`}>
        {active ? (
          <ThreadWindow conversation={active} onBack={closeConversation} onMessageSent={fetchList} />
        ) : (
          <div className="grid h-full place-items-center px-8 text-center text-ink-faint">
            <div>
              <div className="text-4xl">💬</div>
              <p className="mt-3.5 font-bold text-ink-muted">Wybierz rozmowę</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "teraz";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} godz.`;
  return `${Math.floor(hours / 24)} dni`;
}

function previewText(m: ConversationSummary["lastMessage"]): string {
  if (!m) return "Brak wiadomości — napisz pierwszy!";
  if (m.kind === "VIEWING") return `📅 ${m.body}`;
  if (m.kind === "ATTACHMENT") return "🖼 Zdjęcie";
  return m.body;
}
