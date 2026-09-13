import { describe, expect, it } from "vitest";
import { scoreExam } from "@/lib/quiz/scoring";
import type { StoredQuestion } from "@/lib/quiz/types";

const questions: StoredQuestion[] = [
  {
    id: 1,
    questionText: "Single answer fixture",
    requiredSelections: 1,
    explanation: "Fixture explanation",
    enabled: true,
    answers: [
      { id: 11, answerText: "Wrong", correct: false },
      { id: 12, answerText: "Correct", correct: true }
    ]
  },
  {
    id: 2,
    questionText: "Multiple answer fixture",
    requiredSelections: 2,
    explanation: "Fixture explanation",
    enabled: true,
    answers: [
      { id: 21, answerText: "Correct one", correct: true },
      { id: 22, answerText: "Wrong", correct: false },
      { id: 23, answerText: "Correct two", correct: true }
    ]
  }
];

describe("scoreExam", () => {
  it("scores single and multiple answers using exact set matching", () => {
    const result = scoreExam(questions, [
      { questionId: 1, selectedAnswerIds: [12] },
      { questionId: 2, selectedAnswerIds: [23, 21] }
    ]);

    expect(result.correctCount).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("gives no partial credit for a multiple-answer question", () => {
    const result = scoreExam(questions, [
      { questionId: 1, selectedAnswerIds: [11] },
      { questionId: 2, selectedAnswerIds: [21] }
    ]);

    expect(result.results[1].status).toBe("wrong");
    expect(result.correctCount).toBe(0);
  });

  it("tracks unanswered questions separately", () => {
    const result = scoreExam(questions, [
      { questionId: 1, selectedAnswerIds: [] },
      { questionId: 2, selectedAnswerIds: [] }
    ]);

    expect(result.unansweredCount).toBe(2);
    expect(result.wrongCount).toBe(0);
    expect(result.results.every((item) => item.status === "unanswered")).toBe(true);
  });

  it("uses a 65 percent pass threshold", () => {
    const tenQuestions = Array.from({ length: 10 }, (_, index) => ({
      ...questions[0],
      id: index + 1,
      answers: questions[0].answers.map((answer) => ({ ...answer, id: answer.id + index * 100 }))
    }));
    const sevenCorrect = tenQuestions.map((question, index) => ({
      questionId: question.id,
      selectedAnswerIds: [question.answers[index < 7 ? 1 : 0].id]
    }));

    expect(scoreExam(tenQuestions, sevenCorrect).passed).toBe(true);
    expect(scoreExam(tenQuestions, sevenCorrect).percentage).toBe(70);
  });
});
