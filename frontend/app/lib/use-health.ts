"use client";

import { useCallback, useEffect, useState } from "react";
import { checkHealth } from "@/app/lib/api";
import type { HealthStatus } from "@/app/lib/types";

const POLL_MS = 30_000;

export function useHealth(): { status: HealthStatus; refresh: () => void } {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    checkHealth(controller.signal).then((ok) => {
      if (active) setStatus(ok ? "online" : "offline");
    });
    const timer = window.setTimeout(() => setTick((t) => t + 1), POLL_MS);
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [tick]);

  const refresh = useCallback(() => {
    setStatus("checking");
    setTick((t) => t + 1);
  }, []);

  return { status, refresh };
}
