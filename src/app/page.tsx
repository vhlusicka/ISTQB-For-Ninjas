import { StartExamForm } from "@/components/StartExamForm";
import { getAvailableQuestionCount } from "@/lib/quiz/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const availableCount = await getAvailableQuestionCount();

  return (
    <main>
      <section className="shell grid min-h-[calc(100vh-76px)] items-center gap-12 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
        <div className="enter">
          <div className="mb-8 inline-flex items-center gap-3 border border-ink px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
            CTFL practice mode
          </div>
          <h1 className="display-title max-w-3xl text-[clamp(4.4rem,13vw,9rem)]">
            Sharpen<br />
            your <span className="relative text-signal">test</span><br />
            instinct.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Focused ISTQB Foundation Level practice. No noise, no live-generated answers—just source-grounded questions and feedback that makes mistakes useful.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 border-y-2 border-ink py-5">
            <div>
              <strong className="block font-display text-2xl font-black">65%</strong>
              <span className="eyebrow">pass line</span>
            </div>
            <div className="border-x border-line px-5">
              <strong className="block font-display text-2xl font-black">∞</strong>
              <span className="eyebrow">retries</span>
            </div>
            <div className="pl-5">
              <strong className="block font-display text-2xl font-black">0</strong>
              <span className="eyebrow">distractions</span>
            </div>
          </div>
        </div>

        <div className="enter lg:pl-6" style={{ animationDelay: "100ms" }}>
          <StartExamForm availableCount={availableCount} />
        </div>
      </section>

      <section className="border-y-2 border-ink bg-ink py-4 text-paper" aria-label="Product qualities">
        <div className="shell flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] sm:justify-between">
          <span>Official source material</span><span className="text-signal">◆</span>
          <span>Exact-match scoring</span><span className="text-signal">◆</span>
          <span>Private until submit</span><span className="text-signal">◆</span>
          <span>Built for every screen</span>
        </div>
      </section>
    </main>
  );
}
