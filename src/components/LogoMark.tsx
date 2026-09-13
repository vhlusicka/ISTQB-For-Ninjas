export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="ISTQB for ninjas">
      <span className={`${compact ? "h-9 w-9" : "h-11 w-11"} grid shrink-0 place-items-center rounded-full bg-ink text-paper`} aria-hidden="true">
        <svg viewBox="0 0 48 48" className="h-full w-full" fill="none">
          <path d="M7 20.5C12 14 17.4 11 24 11s12 3 17 9.5c-4.6 8.1-10.3 12-17 12s-12.4-3.9-17-12Z" fill="currentColor" />
          <path d="M10 21c5-2.2 9.7-3.3 14-3.3S33 18.8 38 21" stroke="rgb(var(--signal))" strokeWidth="5" />
          <path d="m17 23 5 2.5-5 2M31 23l-5 2.5 5 2" stroke="rgb(var(--paper))" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
      </span>
      <span className={`${compact ? "text-lg" : "text-xl"} font-display font-black uppercase tracking-[-0.035em]`}>
        ISTQB <span className="text-signal">for ninjas</span>
      </span>
    </span>
  );
}
