"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/domain";
import { compressImageToDataUrl } from "@/lib/imageCompress";
import { ViewingPickerModal } from "@/components/detail/ViewingPickerModal";
import type { ConversationSummary } from "./MessagesClient";

interface MessageItem {
  id: string;
  body: string;
  kind: "TEXT" | "VIEWING" | "ATTACHMENT";
  createdAt: string;
  senderId: string;
}

const MSG_POLL_MS = 3000;

const BUYER_TEMPLATES = [
  "Czy mieszkanie jest nadal dostępne?",
  "Czy cena jest do negocjacji?",
  "Jakie są opłaty miesięczne?",
  "Czy mogę umówić oglądanie?",
];
const SELLER_TEMPLATES = [
  "Tak, mieszkanie jest dostępne 🙂",
  "Cena jest lekko do negocjacji",
  "Zapraszam na oglądanie",
  "Prześlę rzut i więcej zdjęć",
];

interface ThreadWindowProps {
  conversation: ConversationSummary;
  onBack: () => void;
  /** Odśwież listę rozmów (podgląd ostatniej wiadomości, licznik nieprzeczytanych). */
  onMessageSent: () => void;
}

export function ThreadWindow({ conversation, onBack, onMessageSent }: ThreadWindowProps) {
  const { data: session } = useSession();
  const myId = (session?.user as { id?: string } | undefined)?.id;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [viewingOpen, setViewingOpen] = useState(false);
  const [attachBusy, setAttachBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCreatedAtRef = useRef<string | null>(null);

  // Rola liczona z REALNYCH danych (czy jestem właścicielem ogłoszenia w tej
  // rozmowie) — nie z fejkowego przełącznika "Jesteś jako" z prototypu
  // (tam był potrzebny, bo jedno konto demo symulowało obie strony).
  const isSeller = !!conversation.listing && myId != null && conversation.listing.ownerId === myId;
  const templates = isSeller ? SELLER_TEMPLATES : BUYER_TEMPLATES;

  const fetchMessages = useCallback(
    (after?: string | null) => {
      const url = after
        ? `/api/conversations/${conversation.id}/messages?after=${encodeURIComponent(after)}`
        : `/api/conversations/${conversation.id}/messages`;
      return fetch(url).then((r) => r.json());
    },
    [conversation.id]
  );

  useEffect(() => {
    setMessages([]);
    lastCreatedAtRef.current = null;
    let cancelled = false;

    fetchMessages().then((d) => {
      if (cancelled) return;
      const msgs: MessageItem[] = d.messages ?? [];
      setMessages(msgs);
      if (msgs.length) lastCreatedAtRef.current = msgs[msgs.length - 1].createdAt;
    });

    fetch(`/api/conversations/${conversation.id}/read`, { method: "POST" }).catch(() => {});

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetchMessages(lastCreatedAtRef.current).then((d) => {
        const fresh: MessageItem[] = d.messages ?? [];
        if (cancelled || fresh.length === 0) return;
        setMessages((prev) => [...prev, ...fresh]);
        lastCreatedAtRef.current = fresh[fresh.length - 1].createdAt;
        fetch(`/api/conversations/${conversation.id}/read`, { method: "POST" }).catch(() => {});
      });
    }, MSG_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversation.id, fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(body: string, kind: MessageItem["kind"] = "TEXT") {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, kind }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        lastCreatedAtRef.current = data.message.createdAt;
        onMessageSent();
      }
    } finally {
      setSending(false);
    }
  }

  function handleSendDraft() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void sendMessage(text, "TEXT");
  }

  async function handleAttach(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setAttachBusy(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      await sendMessage(dataUrl, "ATTACHMENT");
    } catch {
      // brak dedykowanego UI błędu w composerze na razie — cichy fail jest
      // bezpieczny (użytkownik po prostu spróbuje ponownie)
    } finally {
      setAttachBusy(false);
    }
  }

  const gradFrom = conversation.listing?.gradient?.split("-")[0] ?? "#C8553D";
  const gradTo = conversation.listing?.gradient?.split("-")[1] ?? "#9e3f2c";
  const coverPhoto = conversation.listing?.photos?.[0];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line bg-bg-app/95 px-4 py-2.5 backdrop-blur-sm">
        <button onClick={onBack} className="text-lg text-ink-muted sm:hidden" aria-label="Wróć do listy">
          ←
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-terracotta font-extrabold text-white">
          {(conversation.otherUser?.name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-ink">{conversation.otherUser?.name ?? "Użytkownik"}</div>
          <div className="text-xs font-semibold text-[#3F7A52]">
            {isSeller ? "Piszesz jako sprzedający" : "Piszesz jako kupujący"}
          </div>
        </div>
      </div>

      {/* Przypięta oferta */}
      {conversation.listing && (
        <div className="mx-4 mt-3 flex shrink-0 items-center gap-3 rounded-[14px] border border-line bg-card p-2.5 shadow-card">
          <div
            className="h-12 w-[54px] shrink-0 rounded-[10px]"
            style={
              coverPhoto
                ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }
            }
          />
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-bold text-ink">
              {formatPrice(conversation.listing.price)} {conversation.listing.type === "WYNAJEM" ? "zł/mies." : "zł"}
            </div>
            <div className="truncate text-xs font-semibold text-ink-muted">{conversation.listing.district.name}</div>
          </div>
          <a
            href={`/search?id=${conversation.listing.id}`}
            className="shrink-0 whitespace-nowrap rounded-pill border border-line bg-bg-app px-3 py-1.5 text-xs font-bold text-ink-secondary transition hover:border-terracotta hover:text-terracotta"
          >
            Zobacz ofertę
          </a>
        </div>
      )}

      {/* Wiadomości */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === myId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              {m.kind === "ATTACHMENT" ? (
                <div className={`max-w-[74%] overflow-hidden rounded-2xl border p-1 ${mine ? "border-terracotta" : "border-line"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.body} alt="Załącznik" className="max-h-64 rounded-xl object-cover" />
                </div>
              ) : m.kind === "VIEWING" ? (
                <div
                  className={`flex max-w-[75%] items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine ? "bg-terracotta text-white" : "border border-line bg-card text-ink"
                  }`}
                >
                  <span className="text-lg">📅</span>
                  <div>
                    <div
                      className={`text-[10.5px] font-bold uppercase tracking-[.4px] ${mine ? "text-white/75" : "text-ink-faint"}`}
                    >
                      Propozycja oglądania
                    </div>
                    <div className="font-bold">{m.body}</div>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    mine ? "rounded-br-[5px] bg-terracotta text-white" : "rounded-bl-[5px] border border-line bg-card text-ink"
                  }`}
                >
                  {m.body}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Szybkie szablony */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto px-3.5 pt-2">
        {templates.map((t) => (
          <button
            key={t}
            onClick={() => void sendMessage(t, "TEXT")}
            className="shrink-0 whitespace-nowrap rounded-pill border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink-secondary transition hover:border-terracotta hover:text-terracotta"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="flex shrink-0 items-center gap-2 p-3.5">
        <label
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-line bg-card text-ink-muted transition hover:border-terracotta hover:text-terracotta"
          title="Załącznik"
        >
          {attachBusy ? "…" : "📎"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={attachBusy}
            onChange={(e) => {
              void handleAttach(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <button
          onClick={() => setViewingOpen(true)}
          title="Umów oglądanie"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-line bg-card text-ink-muted transition hover:border-terracotta hover:text-terracotta"
        >
          📅
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendDraft();
          }}
          placeholder="Napisz wiadomość…"
          className="min-w-0 flex-1 rounded-pill border border-line bg-card px-4 py-2.5 text-sm text-ink outline-none focus:border-terracotta/60"
        />
        <button
          onClick={handleSendDraft}
          disabled={!draft.trim() || sending}
          title="Wyślij"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-terracotta text-lg text-white transition hover:bg-terracotta-hover disabled:opacity-50"
        >
          ➤
        </button>
      </div>

      <ViewingPickerModal
        open={viewingOpen}
        onClose={() => setViewingOpen(false)}
        onPickSlot={(slot) => {
          setViewingOpen(false);
          void sendMessage(slot, "VIEWING");
        }}
      />
    </div>
  );
}
