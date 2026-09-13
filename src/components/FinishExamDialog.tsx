"use client";

import { useEffect, useRef } from "react";

type FinishExamDialogProps = {
  unansweredCount: number;
  busy: boolean;
  onContinue: () => void;
  onFinish: () => void;
};

export function FinishExamDialog({ unansweredCount, busy, onContinue, onFinish }: FinishExamDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onContinue();
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [busy, onContinue]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/75 p-5" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onContinue();
    }}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="finish-title"
        aria-describedby="finish-description"
        tabIndex={-1}
        className="hard-card w-full max-w-lg p-6 sm:p-8"
      >
        <p className="eyebrow text-signal">Final checkpoint</p>
        <h2 id="finish-title" className="mt-2 font-display text-4xl font-black uppercase tracking-[-0.04em]">
          Ready to finish?
        </h2>
        <p id="finish-description" className="mt-5 text-lg leading-relaxed text-muted">
          {unansweredCount > 0 ? (
            <>You have <strong className="text-ink">{unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"}</strong>. Unanswered questions count as incorrect.</>
          ) : (
            <>Every question has an answer. Once submitted, your choices become final.</>
          )}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onContinue} disabled={busy} className="secondary-button">Continue exam</button>
          <button type="button" onClick={onFinish} disabled={busy} className="primary-button">
            {busy ? "Scoring…" : "Finish the exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
