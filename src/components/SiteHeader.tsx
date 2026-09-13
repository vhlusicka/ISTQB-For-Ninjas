import Link from "next/link";
import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="shell flex min-h-[76px] items-center justify-between gap-5">
        <Link href="/" className="rounded-sm"><LogoMark compact /></Link>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted md:inline">CTFL training ground</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
