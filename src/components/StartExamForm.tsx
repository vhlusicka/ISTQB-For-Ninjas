"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicQuestion } from "@/lib/quiz/types";

const OPTIONS = [5, 10, 20, 40];

export function StartExamForm({ availableCount }: { availableCount: number }) {
  const router = useRouter();
  const firstAvailable = OPTIONS.find((option) => option <= availableCount) ?? Math.max(1, availableCount);
  const [count, setCount] = useState(firstAvailable);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startExam() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionCount: count })
      });
      const data = await response.json() as { questions?: PublicQuestion[]; error?: string };
      if (!response.ok || !data.questions) throw new Error(data.error ?? "Could not start the exam.");
      sessionStorage.setItem("istqb-active-exam", JSON.stringify(data.questions));
      sessionStorage.removeItem("istqb-exam-result");
      sessionStorage.removeItem("istqb-exam-selections");
      router.push("/quiz");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the exam.");
      setLoading(false);
    }
  }

  return (
    <div className="hard-card relative p-6 sm:p-8">
      <span className="absolute -right-2 -top-3 rotate-3 bg-acid px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-950">
        choose your drill
      </span>
      <p className="eyebrow mb-2">Exam configuration</p>
      <h2 className="font-display text-3xl font-black uppercase tracking-[-0.04em]">How many questions?</h2>

      <fieldset className="mt-7 grid grid-cols-2 gap-3">
        <legend className="sr-only">Number of questions</legend>
        {OPTIONS.map((option) => {
          const disabled = option > availableCount;
          const selected = count === option;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => setCount(option)}
              aria-pressed={selected}
              className={`relative min-h-16 border-2 px-3 font-display text-2xl font-black transition-all ${
                selected
                  ? "border-ink bg-ink text-paper shadow-[inset_0_-5px_0_rgb(var(--signal))]"
                  : "border-line bg-paper hover:border-ink"
              } disabled:cursor-not-allowed disabled:opacity-35`}
            >
              {option}
              {disabled && <span className="ml-2 align-middle font-mono text-[8px] uppercase tracking-wider">locked</span>}
            </button>
          );
        })}
      </fieldset>

      <div className="mt-6 flex items-center justify-between border-y border-line py-3 text-sm">
        <span className="text-muted">Available in the dojo</span>
        <strong className="font-mono">{availableCount} questions</strong>
      </div>

      {error && <p role="alert" className="mt-4 border-l-4 border-signal pl-3 text-sm text-signal">{error}</p>}
      <button onClick={startExam} disabled={loading || availableCount < 1} className="primary-button mt-6 w-full">
        {loading ? "Preparing exam…" : "Start"}
        {!loading && <span aria-hidden="true">→</span>}
      </button>
      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-muted">Untimed · 65% to pass · answers saved as you go</p>
    </div>
  );
}
