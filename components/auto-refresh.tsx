"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Rafraîchit les données de la page toutes les N secondes (scores en direct, etc.)
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
