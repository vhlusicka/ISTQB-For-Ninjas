"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionResult, QuizResult } from "@/lib/quiz/types";

const answerLabel = (index: number) => String.fromCharCode(65 + index);

function ReviewCard({ result, index }: { result: QuestionResult; index: number }) {
  const [showExplanation, setShowExplanation] = useState(result.status !== "correct");
  const statusLabel = result.status === "correct" ? "Correct" : result.status === "wrong" ? "Wrong" : "Unanswered";

  return (
    <article className="border-2 border-ink bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink px-5 py-4 sm:px-7">
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Question {index + 1}</span>
        <span className={`inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] ${result.status === "correct" ? "text-emerald-700 dark:text-emerald-400" : "text-signal"}`}>
          <span aria-hidden="true">{result.status === "correct" ? "✓" : result.status === "wrong" ? "✕" : "○"}</span>{statusLabel}
        </span>
      </div>
      <div className="p-5 sm:p-7">
        <h3 className="whitespace-pre-line text-lg font-bold leading-snug sm:text-xl">{result.questionText}</h3>
        <div className="mt-6 space-y-2">
          {result.answers.map((answer, answerIndex) => {
            const wrongPick = answer.selected && !answer.correct;
            const correctPick = answer.correct;
            return (
              <div key={answer.id} className={`flex items-start gap-3 border p-3 text-sm leading-relaxed ${correctPick ? "border-emerald-600 bg-emerald-500/10" : wrongPick ? "border-signal bg-signal/10" : "border-line opacity-65"}`}>
                <span className="grid h-7 w-7 shrink-0 place-items-center border border-current font-mono text-[10px] font-black">{answerLabel(answerIndex)}</span>
                <span className="flex-1">{answer.answerText}</span>
                <span className="shrink-0 font-mono text-[9px] font-black uppercase tracking-wider">
                  {correctPick && answer.selected ? "Your answer · Correct" : correctPick ? "Correct answer" : wrongPick ? "Your answer" : ""}
                </span>
              </div>
            );
          })}
        </div>

        {showExplanation ? (
          <div className="mt-6 border-l-4 border-acid bg-ink/[0.04] p-4">
            <p className="eyebrow mb-2">Why</p>
            <p className="text-sm leading-relaxed text-muted">{result.explanation}</p>
          </div>
        ) : (
          <button type="button" onClick={() => setShowExplanation(true)} className="mt-5 font-mono text-[10px] font-black uppercase tracking-wider underline decoration-2 underline-offset-4">
            Show explanation
          </button>
        )}
      </div>
    </article>
  );
}

export function ResultsScreen() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("istqb-exam-result");
      if (!stored) return router.replace("/");
      setResult(JSON.parse(stored) as QuizResult);
      setReady(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  function backToStart() {
    sessionStorage.removeItem("istqb-active-exam");
    sessionStorage.removeItem("istqb-exam-selections");
    sessionStorage.removeItem("istqb-exam-result");
    router.push("/");
  }

  if (!ready || !result) {
    return <main className="shell grid min-h-[70vh] place-items-center"><p className="eyebrow animate-pulse">Loading your results…</p></main>;
  }

  return (
    <main className="pb-20">
      <section className={`border-b-2 border-ink ${result.passed ? "bg-acid text-neutral-950" : "bg-signal text-white"}`}>
        <div className="shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="enter">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.22em]">Exam complete / result</p>
            <h1 className="display-title mt-4 text-[clamp(4rem,13vw,8.5rem)]">{result.passed ? "Pass" : "Not passed"}</h1>
            <p className="mt-5 max-w-xl text-base font-bold leading-relaxed opacity-80">
              {result.passed ? "Solid work. Review the detail, lock in what you know, and keep the blade sharp." : "This run is data, not defeat. Review every miss, learn the pattern, and return stronger."}
            </p>
          </div>
          <div className="border-2 border-current bg-paper px-8 py-6 text-ink shadow-hard-sm">
            <span className="eyebrow">Final score</span>
            <div className="mt-1 font-display text-7xl font-black tracking-[-0.06em]">{result.score}<span className="text-3xl text-muted">/{result.total}</span></div>
            <div className="mt-2 font-mono text-sm font-black uppercase tracking-wider">{result.percentage}%</div>
          </div>
        </div>
      </section>

      <div className="shell">
        <section className="-mt-1 grid border-2 border-ink bg-panel sm:grid-cols-4" aria-label="Result breakdown">
          {[
            ["Correct", result.correctCount, "text-emerald-700 dark:text-emerald-400"],
            ["Wrong", result.wrongCount, "text-signal"],
            ["Unanswered", result.unansweredCount, "text-muted"],
            ["Total", result.total, "text-ink"]
          ].map(([label, value, color], index) => (
            <div key={String(label)} className={`p-5 text-center ${index > 0 ? "border-t sm:border-l sm:border-t-0" : ""}`}>
              <strong className={`block font-display text-3xl font-black ${color}`}>{value}</strong>
              <span className="eyebrow">{label}</span>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-14 max-w-4xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Debrief</p>
              <h2 className="mt-1 font-display text-4xl font-black uppercase tracking-[-0.04em]">Answer review</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">Correct answers are outlined in green. Incorrect selections are marked in red.</p>
          </div>

          <div className="space-y-6">
            {result.results.map((questionResult, index) => (
              <ReviewCard key={questionResult.questionId} result={questionResult} index={index} />
            ))}
          </div>

          <div className="mt-12 border-t-2 border-ink pt-8 text-center">
            <button type="button" onClick={backToStart} className="primary-button w-full sm:w-auto">← Back to start</button>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">A fresh exam will randomize the question order</p>
          </div>
        </section>
      </div>
    </main>
  );
}
