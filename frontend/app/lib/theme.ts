"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ThemePref = "light" | "dark" | "system";

const KEY = "theme";
const EVENT = "theme-change";
const QUERY = "(prefers-color-scheme: dark)";

function read(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(pref: ThemePref): void {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia(QUERY).matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function subscribe(notify: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  const sync = () => {
    apply(read());
    notify();
  };
  window.addEventListener("storage", sync);
  window.addEventListener(EVENT, notify);
  mq.addEventListener("change", sync);
  return () => {
    window.removeEventListener("storage", sync);
    window.removeEventListener(EVENT, notify);
    mq.removeEventListener("change", sync);
  };
}

export function useTheme(): { theme: ThemePref; setTheme: (pref: ThemePref) => void } {
  const theme = useSyncExternalStore<ThemePref>(subscribe, read, () => "system");
  const setTheme = useCallback((pref: ThemePref) => {
    try {
      if (pref === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, pref);
    } catch {
      /* storage unavailable: theme still applies for this page view */
    }
    apply(pref);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { theme, setTheme };
}
