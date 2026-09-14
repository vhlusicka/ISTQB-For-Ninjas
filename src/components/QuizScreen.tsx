"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuestion, QuizResult } from "@/lib/quiz/types";
import { FinishExamDialog } from "./FinishExamDialog";

type Selections = Record<number, number[]>;

const answerLabel = (index: number) => String.fromCharCode(65 + index);

export function QuizScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [selections, setSelections] = useState<Selections>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectionNotice, setSelectionNotice] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("istqb-active-exam");
      if (!stored) return router.replace("/");
      const parsed = JSON.parse(stored) as PublicQuestion[];
      if (!Array.isArray(parsed) || parsed.length === 0) return router.replace("/");
      setQuestions(parsed);
      const saved = sessionStorage.getItem("istqb-exam-selections");
      if (saved) setSelections(JSON.parse(saved) as Selections);
      setReady(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const question = questions[currentIndex];
  const answeredCount = useMemo(
    () => questions.filter((item) => (selections[item.id]?.length ?? 0) > 0).length,
    [questions, selections]
  );
  const unansweredCount = questions.length - answeredCount;

  function persist(next: Selections) {
    setSelections(next);
    sessionStorage.setItem("istqb-exam-selections", JSON.stringify(next));
  }

  function choose(answerId: number) {
    if (!question) return;
    setSelectionNotice("");
    const current = selections[question.id] ?? [];
    let nextIds: number[];

    if (question.requiredSelections === 1) {
      nextIds = [answerId];
    } else if (current.includes(answerId)) {
      nextIds = current.filter((id) => id !== answerId);
    } else if (current.length >= question.requiredSelections) {
      setSelectionNotice(`Select no more than ${question.requiredSelections} answers.`);
      return;
    } else {
      nextIds = [...current, answerId];
    }
    persist({ ...selections, [question.id]: nextIds });
  }

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  async function submitExam() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((item) => ({
            questionId: item.id,
            selectedAnswerIds: selections[item.id] ?? []
          }))
        })
      });
      const data = await response.json() as QuizResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not score the exam.");
      sessionStorage.setItem("istqb-exam-result", JSON.stringify(data));
      router.push("/results");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not score the exam.");
      setDialogOpen(false);
      setBusy(false);
    }
  }

  if (!ready || !question) {
    return <main className="shell grid min-h-[70vh] place-items-center"><p className="eyebrow animate-pulse">Preparing your exam…</p></main>;
  }

  const selected = selections[question.id] ?? [];
  const instruction = question.requiredSelections === 1
    ? "Select one answer"
    : `Select ${question.requiredSelections} answers`;

  return (
    <main className="shell py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Practice exam / in progress</p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-[-0.04em]">Question {currentIndex + 1} <span className="text-muted">of {questions.length}</span></h1>
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider"><span className="text-signal">{answeredCount}</span> answered · {unansweredCount} open</p>
        </div>

        <div className="h-2 border border-ink bg-panel" aria-label={`${Math.round(((currentIndex + 1) / questions.length) * 100)} percent through exam`} role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={currentIndex + 1}>
          <div className="h-full bg-signal transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <article className="hard-card enter mt-7 p-5 sm:p-9" key={question.id}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <span className="eyebrow text-signal">{instruction}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{selected.length}/{question.requiredSelections} selected</span>
          </div>
          <h2 className="mt-7 whitespace-pre-line text-xl font-bold leading-snug sm:text-2xl">{question.questionText}</h2>

          <fieldset className="mt-8 space-y-3">
            <legend className="sr-only">{instruction}</legend>
            {question.answers.map((answer, index) => {
              const checked = selected.includes(answer.id);
              return (
                <label key={answer.id} className={`group flex min-h-16 cursor-pointer items-start gap-4 border-2 p-4 transition-all ${checked ? "border-ink bg-ink text-paper shadow-[inset_5px_0_0_rgb(var(--signal))]" : "border-line bg-paper hover:border-ink"}`}>
                  <input
                    type={question.requiredSelections === 1 ? "radio" : "checkbox"}
                    name={`question-${question.id}`}
                    value={answer.id}
                    checked={checked}
                    onChange={() => choose(answer.id)}
                    className="sr-only"
                  />
                  <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center border-2 font-mono text-xs font-black ${checked ? "border-signal bg-signal text-white" : "border-current"}`}>
                    {checked ? "✓" : answerLabel(index)}
                  </span>
                  <span className="pt-1 text-sm leading-relaxed sm:text-base">{answer.answerText}</span>
                </label>
              );
            })}
          </fieldset>
          <p className="mt-4 min-h-5 text-sm font-bold text-signal" role="status">{selectionNotice}</p>
        </article>

        {error && <p role="alert" className="mt-6 border-2 border-signal bg-panel p-4 text-sm font-bold text-signal">{error}</p>}

        <nav className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:items-center" aria-label="Question navigation">
          <button type="button" onClick={() => { setCurrentIndex((value) => value - 1); setSelectionNotice(""); }} disabled={currentIndex === 0} className="secondary-button">← Previous</button>
          <button type="button" onClick={() => { setCurrentIndex((value) => value + 1); setSelectionNotice(""); }} disabled={currentIndex === questions.length - 1} className="secondary-button">Next →</button>
          <button type="button" onClick={() => setDialogOpen(true)} className="primary-button col-span-2 sm:ml-auto">Finish the exam</button>
        </nav>

        <div className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Jump to question">
          {questions.map((item, index) => {
            const answered = (selections[item.id]?.length ?? 0) > 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setCurrentIndex(index); setSelectionNotice(""); }}
                aria-label={`Question ${index + 1}${answered ? ", answered" : ", unanswered"}`}
                aria-current={index === currentIndex ? "step" : undefined}
                className={`grid h-10 w-10 place-items-center border-2 font-mono text-xs font-bold transition-colors ${index === currentIndex ? "border-signal bg-signal text-white" : answered ? "border-ink bg-ink text-paper" : "border-line bg-panel hover:border-ink"}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {dialogOpen && (
        <FinishExamDialog unansweredCount={unansweredCount} busy={busy} onContinue={closeDialog} onFinish={submitExam} />
      )}
    </main>
  );
}
