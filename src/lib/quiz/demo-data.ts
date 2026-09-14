import "server-only";
import initialQuestionDocument from "../../../knowledge database/imported/questions.json";
import additionalQuestionDocument from "../../../knowledge database/imported/official-sample-exams-additional.json";
import type { StoredQuestion } from "./types";

// The development fallback uses the same validated import documents as
// Supabase. Keeping the answer key in this server-only module prevents correct
// answers and explanations from entering the browser bundle before submission.
const importedQuestions = [
  ...initialQuestionDocument.questions,
  ...additionalQuestionDocument.questions
];

export const demoQuestions: StoredQuestion[] = importedQuestions.map((question, questionIndex) => {
  const questionId = questionIndex + 1;
  return {
    id: questionId,
    questionText: question.question_text,
    requiredSelections: question.required_selections,
    explanation: question.explanation,
    enabled: true,
    answers: question.answers.map((answer, answerIndex) => ({
      id: questionId * 100 + answerIndex + 1,
      answerText: answer.answer_text,
      correct: answer.correct
    }))
  };
});
