"use client";

import { useEffect, useState } from "react";
import { api, type Health } from "./api";

/** Polls /health. `null` while the first check is in flight. */
export function useHealth(intervalMs = 30_000) {
  const [health, setHealth] = useState<Health | null>(null);
  const [up, setUp] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      let next: Health | null = null;
      try {
        next = await api.health();
      } catch {
        /* offline */
      }
      if (!alive) return;
      setHealth(next);
      setUp(!!next?.ok);
    };
    check();
    const t = setInterval(check, intervalMs);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [intervalMs]);

  return { health, up, aiAvailable: !!health?.ai };
}
