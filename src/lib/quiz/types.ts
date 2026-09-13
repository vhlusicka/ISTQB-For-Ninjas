export type PublicAnswer = {
  id: number;
  answerText: string;
};

export type PublicQuestion = {
  id: number;
  questionText: string;
  requiredSelections: number;
  answers: PublicAnswer[];
};

export type StoredAnswer = PublicAnswer & { correct: boolean };

export type StoredQuestion = Omit<PublicQuestion, "answers"> & {
  explanation: string;
  enabled: boolean;
  answers: StoredAnswer[];
};

export type SubmittedAnswer = {
  questionId: number;
  selectedAnswerIds: number[];
};

export type ReviewAnswer = PublicAnswer & {
  selected: boolean;
  correct: boolean;
};

export type QuestionResult = {
  questionId: number;
  questionText: string;
  requiredSelections: number;
  status: "correct" | "wrong" | "unanswered";
  explanation: string;
  answers: ReviewAnswer[];
};

export type QuizResult = {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  results: QuestionResult[];
};
