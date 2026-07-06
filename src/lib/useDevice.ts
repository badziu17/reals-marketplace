"use client";

import { useState, useEffect } from "react";

export type Device = "desktop" | "mobile";

const STORAGE_KEY = "reals-device";

export function useDevice() {
  const [device, setDevice] = useState<Device>("desktop");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as Device | null;
    if (saved === "mobile" || saved === "desktop") setDevice(saved);
  }, []);

  function toggle(next: Device) {
    setDevice(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { device, toggle, mounted };
}

const MOBILE_BREAKPOINT_QUERY = "(max-width: 1023px)";

/**
 * Efektywny "widok mobilny" dla ekranu Search (iteracja 7): albo ktoś
 * ręcznie przełączył device na "mobile" w headerze (podgląd na desktopie),
 * albo realna szerokość okna jest wąska (prawdziwy telefon — na nim same
 * przyciski przełącznika są ukryte, więc to jedyny sposób, żeby tam
 * zadziałało poprawnie).
 *
 * `false` dopóki `mounted` jest `false`, żeby pierwszy render klienta
 * pokrywał się z tym, co wyrenderował serwer (patrz analogiczna poprawka
 * przy `origin` w SearchClient — czytanie realnej szerokości okna wprost
 * w renderze dawałoby różny wynik server/klient i błąd hydratacji).
 */
export function useIsMobileSearch(): { isMobile: boolean; mounted: boolean } {
  const { device, mounted } = useDevice();
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const update = () => setNarrowViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return { isMobile: mounted && (device === "mobile" || narrowViewport), mounted };
}
