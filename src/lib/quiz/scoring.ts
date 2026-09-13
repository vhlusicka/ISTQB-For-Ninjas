import type { QuizResult, StoredQuestion, SubmittedAnswer } from "./types";

export const PASS_THRESHOLD = 65;

function sameAnswerSet(actual: number[], expected: number[]) {
  if (actual.length !== expected.length) return false;
  const actualSet = new Set(actual);
  return expected.every((id) => actualSet.has(id));
}

export function scoreExam(
  questions: StoredQuestion[],
  submissions: SubmittedAnswer[]
): QuizResult {
  const submissionMap = new Map(
    submissions.map((submission) => [submission.questionId, submission.selectedAnswerIds])
  );

  const results = questions.map((question) => {
    const selectedIds = submissionMap.get(question.id) ?? [];
    const correctIds = question.answers.filter((answer) => answer.correct).map((answer) => answer.id);
    const unanswered = selectedIds.length === 0;
    const correct = !unanswered && sameAnswerSet(selectedIds, correctIds);

    return {
      questionId: question.id,
      questionText: question.questionText,
      requiredSelections: question.requiredSelections,
      status: unanswered ? "unanswered" as const : correct ? "correct" as const : "wrong" as const,
      explanation: question.explanation,
      answers: question.answers.map((answer) => ({
        id: answer.id,
        answerText: answer.answerText,
        selected: selectedIds.includes(answer.id),
        correct: answer.correct
      }))
    };
  });

  const correctCount = results.filter((result) => result.status === "correct").length;
  const unansweredCount = results.filter((result) => result.status === "unanswered").length;
  const wrongCount = results.length - correctCount - unansweredCount;
  const percentage = Math.round((correctCount / results.length) * 100);

  return {
    score: correctCount,
    total: results.length,
    percentage,
    passed: percentage >= PASS_THRESHOLD,
    correctCount,
    wrongCount,
    unansweredCount,
    results
  };
}
