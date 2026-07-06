"use client";

import { useRouter } from "next/navigation";
import { ListingCard } from "./ListingCard";
import type { ComponentProps } from "react";

type CardListing = ComponentProps<typeof ListingCard>["listing"];

/**
 * Strony poza /search (np. landing) nie mają własnego stanu Detail overlay —
 * ten cienki client-wrapper po prostu nawiguje do /search?id=..., gdzie
 * Detail otwiera się automatycznie (patrz initialSelectedId w search/page.tsx,
 * iteracja 8).
 */
export function ListingCardLink({ listing }: { listing: CardListing }) {
  const router = useRouter();
  return <ListingCard listing={listing} onOpen={(id) => router.push(`/search?id=${id}`)} />;
}
