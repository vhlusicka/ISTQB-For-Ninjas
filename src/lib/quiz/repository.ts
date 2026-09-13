import "server-only";
import { demoQuestions } from "./demo-data";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { StoredQuestion } from "./types";

type QuestionRow = {
  id: number;
  question_text: string;
  required_selections: number;
  explanation: string;
  enabled: boolean;
  answers: { id: number; answer_text: string; correct: boolean }[];
};

function mapQuestion(row: QuestionRow): StoredQuestion {
  return {
    id: row.id,
    questionText: row.question_text,
    requiredSelections: row.required_selections,
    explanation: row.explanation,
    enabled: row.enabled,
    answers: [...row.answers]
      .sort((a, b) => a.id - b.id)
      .map((answer) => ({ id: answer.id, answerText: answer.answer_text, correct: answer.correct }))
  };
}

export async function getEnabledQuestions(): Promise<StoredQuestion[]> {
  if (!hasSupabaseConfig()) return demoQuestions.filter((question) => question.enabled);

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, question_text, required_selections, explanation, enabled, answers(id, answer_text, correct)")
    .eq("enabled", true);

  if (error) throw new Error(`Unable to load questions: ${error.message}`);
  return (data as QuestionRow[]).map(mapQuestion);
}

export async function getQuestionsByIds(ids: number[]): Promise<StoredQuestion[]> {
  if (!hasSupabaseConfig()) {
    const wanted = new Set(ids);
    return demoQuestions.filter((question) => question.enabled && wanted.has(question.id));
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, question_text, required_selections, explanation, enabled, answers(id, answer_text, correct)")
    .in("id", ids)
    .eq("enabled", true);

  if (error) throw new Error(`Unable to load submitted questions: ${error.message}`);
  return (data as QuestionRow[]).map(mapQuestion);
}

export async function getAvailableQuestionCount() {
  if (!hasSupabaseConfig()) return demoQuestions.filter((question) => question.enabled).length;

  const supabase = createServerSupabaseClient();
  const { count, error } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("enabled", true);

  if (error) throw new Error(`Unable to count questions: ${error.message}`);
  return count ?? 0;
}
