import { z } from "zod";

export const examConfigurationSchema = z.object({
  questionCount: z.number().int().min(1).max(100)
});

export const submittedAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  selectedAnswerIds: z.array(z.number().int().positive()).max(20).refine(
    (ids) => new Set(ids).size === ids.length,
    "Selected answer IDs must be unique"
  )
});

export const examSubmissionSchema = z.object({
  answers: z.array(submittedAnswerSchema).min(1).max(100).refine(
    (answers) => new Set(answers.map((answer) => answer.questionId)).size === answers.length,
    "Question IDs must be unique"
  )
});

const importedAnswerSchema = z.object({
  answer_text: z.string().trim().min(1),
  correct: z.boolean()
});

export const importedQuestionSchema = z.object({
  question_text: z.string().trim().min(1),
  required_selections: z.number().int().min(1),
  explanation: z.string().trim().min(1),
  enabled: z.boolean().optional().default(true),
  answers: z.array(importedAnswerSchema).min(2)
}).superRefine((question, context) => {
  const correctCount = question.answers.filter((answer) => answer.correct).length;
  if (correctCount !== question.required_selections) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["required_selections"],
      message: `Expected ${question.required_selections} correct answers, found ${correctCount}`
    });
  }
  if (question.required_selections > question.answers.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["required_selections"],
      message: "Required selections cannot exceed the answer count"
    });
  }
});

export const questionImportSchema = z.object({
  questions: z.array(importedQuestionSchema).min(1)
});

export type QuestionImport = z.infer<typeof questionImportSchema>;
