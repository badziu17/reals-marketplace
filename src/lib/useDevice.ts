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
