import { NextResponse } from "next/server";
import { getEnabledQuestions } from "@/lib/quiz/repository";
import { examConfigurationSchema } from "@/schemas/quiz";

export const dynamic = "force-dynamic";

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function POST(request: Request) {
  try {
    const parsed = examConfigurationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Choose a valid number of questions." }, { status: 400 });
    }

    const available = await getEnabledQuestions();
    if (parsed.data.questionCount > available.length) {
      return NextResponse.json(
        { error: `Only ${available.length} questions are currently available.` },
        { status: 400 }
      );
    }

    const questions = shuffle(available)
      .slice(0, parsed.data.questionCount)
      .map((question) => ({
        id: question.id,
        questionText: question.questionText,
        requiredSelections: question.requiredSelections,
        answers: question.answers.map((answer) => ({
          id: answer.id,
          answerText: answer.answerText
        }))
      }));

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "The exam could not be started. Please try again." }, { status: 500 });
  }
}
