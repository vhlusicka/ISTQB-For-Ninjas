import { describe, expect, it } from "vitest";
import initialQuestions from "../../knowledge database/imported/questions.json";
import additionalQuestions from "../../knowledge database/imported/official-sample-exams-additional.json";
import { questionImportSchema } from "@/schemas/quiz";

describe("official question imports", () => {
  it("validates both import documents", () => {
    expect(questionImportSchema.safeParse(initialQuestions).success).toBe(true);
    expect(questionImportSchema.safeParse(additionalQuestions).success).toBe(true);
  });

  it("contains 160 unique source-grounded questions", () => {
    const questions = [...initialQuestions.questions, ...additionalQuestions.questions];
    const uniqueTexts = new Set(questions.map((question) => question.question_text.trim().toLowerCase()));

    expect(questions).toHaveLength(160);
    expect(uniqueTexts.size).toBe(160);
    expect(additionalQuestions.questions.every((question) => question.source_reference.length > 0)).toBe(true);
    expect(additionalQuestions.metadata.excluded).toEqual([]);
  });
});
