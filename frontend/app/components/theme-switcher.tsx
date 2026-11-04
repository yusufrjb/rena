"use client";

import React from "react";
import { useTheme, type ThemePref } from "@/app/lib/theme";
import { MonitorIcon, MoonIcon, SunIcon } from "@/app/components/icons";

const OPTIONS: { key: ThemePref; label: string; Icon: typeof SunIcon }[] = [
  { key: "light", label: "Light", Icon: SunIcon },
  { key: "dark", label: "Dark", Icon: MoonIcon },
  { key: "system", label: "System", Icon: MonitorIcon },
];

export function ThemeSwitcher(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Color theme" className="inline-flex shrink-0 rounded-lg border border-border bg-subtle p-0.5">
      {OPTIONS.map(({ key, label, Icon }) => {
        const active = theme === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(key)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors sm:h-7 sm:w-7 ${
              active ? "bg-panel text-link shadow-soft" : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
