import { NextResponse } from "next/server";
import { getQuestionsByIds } from "@/lib/quiz/repository";
import { scoreExam } from "@/lib/quiz/scoring";
import { examSubmissionSchema } from "@/schemas/quiz";

export async function POST(request: Request) {
  try {
    const parsed = examSubmissionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "The submitted answers are invalid." }, { status: 400 });
    }

    const ids = parsed.data.answers.map((answer) => answer.questionId);
    const loaded = await getQuestionsByIds(ids);
    if (loaded.length !== ids.length) {
      return NextResponse.json({ error: "One or more questions are unavailable." }, { status: 400 });
    }

    const questionMap = new Map(loaded.map((question) => [question.id, question]));
    const questions = ids.map((id) => questionMap.get(id)!);

    for (const submission of parsed.data.answers) {
      const question = questionMap.get(submission.questionId)!;
      const validIds = new Set(question.answers.map((answer) => answer.id));
      if (
        submission.selectedAnswerIds.length > question.requiredSelections ||
        submission.selectedAnswerIds.some((id) => !validIds.has(id))
      ) {
        return NextResponse.json({ error: "A selected answer is invalid." }, { status: 400 });
      }
    }

    return NextResponse.json(scoreExam(questions, parsed.data.answers));
  } catch {
    return NextResponse.json({ error: "The exam could not be scored. Please try again." }, { status: 500 });
  }
}
