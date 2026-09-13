"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = ["system", "light", "dark"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && themes.includes(theme as (typeof themes)[number]) ? theme! : "system";
  const next = themes[(themes.indexOf(active as (typeof themes)[number]) + 1) % themes.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex min-h-11 items-center gap-2 border-2 border-ink bg-panel px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
      aria-label={`Theme: ${active}. Switch to ${next}.`}
      title={`Theme: ${active}`}
    >
      <span className="relative h-4 w-4 rounded-full border-2 border-current" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 w-1/2 rounded-l-full bg-current" />
      </span>
      <span className="hidden sm:inline">{active}</span>
    </button>
  );
}
