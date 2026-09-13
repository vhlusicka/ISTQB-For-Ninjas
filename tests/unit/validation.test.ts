import { describe, expect, it } from "vitest";
import { examConfigurationSchema, questionImportSchema } from "@/schemas/quiz";

describe("quiz validation", () => {
  it("rejects invalid exam sizes", () => {
    expect(examConfigurationSchema.safeParse({ questionCount: 0 }).success).toBe(false);
    expect(examConfigurationSchema.safeParse({ questionCount: 5.5 }).success).toBe(false);
    expect(examConfigurationSchema.safeParse({ questionCount: 20 }).success).toBe(true);
  });

  it("rejects imports whose correct count does not match required selections", () => {
    const result = questionImportSchema.safeParse({
      questions: [{
        question_text: "Fixture?",
        required_selections: 2,
        explanation: "Because this is a fixture.",
        answers: [
          { answer_text: "A", correct: true },
          { answer_text: "B", correct: false }
        ]
      }]
    });

    expect(result.success).toBe(false);
  });
});
