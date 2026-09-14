import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { questionImportSchema } from "../src/schemas/quiz";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const source = process.argv[2];
  if (!source) {
    throw new Error("Usage: npm run import-questions -- \"./knowledge database/imported/questions.json\"");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

  const raw = JSON.parse(await readFile(resolve(process.cwd(), source), "utf8"));
  const parsed = questionImportSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(parsed.error.format());
    throw new Error("Question import failed validation; nothing was inserted.");
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  let imported = 0;
  let skipped = 0;

  const { data: existingRows, error: existingError } = await supabase
    .from("questions")
    .select("question_text");
  if (existingError) throw new Error(`Could not check existing questions: ${existingError.message}`);
  const existingQuestionTexts = new Set(
    (existingRows ?? []).map((row: { question_text: string }) => row.question_text.trim())
  );

  for (const question of parsed.data.questions) {
    if (existingQuestionTexts.has(question.question_text.trim())) {
      skipped += 1;
      continue;
    }

    // Insert disabled so the deferred database invariant permits answers to be
    // added safely. Only enable after the entire question is valid and stored.
    const { data: inserted, error: questionError } = await supabase
      .from("questions")
      .insert({
        question_text: question.question_text,
        required_selections: question.required_selections,
        explanation: question.explanation,
        enabled: false
      })
      .select("id")
      .single();

    if (questionError || !inserted) throw new Error(`Question ${imported + 1}: ${questionError?.message ?? "insert failed"}`);

    const { error: answerError } = await supabase.from("answers").insert(
      question.answers.map((answer) => ({ question_id: inserted.id, ...answer }))
    );

    if (answerError) {
      await supabase.from("questions").delete().eq("id", inserted.id);
      throw new Error(`Question ${imported + 1} answers: ${answerError.message}`);
    }

    if (question.enabled) {
      const { error: enableError } = await supabase.from("questions").update({ enabled: true }).eq("id", inserted.id);
      if (enableError) {
        await supabase.from("questions").delete().eq("id", inserted.id);
        throw new Error(`Question ${imported + 1} could not be enabled: ${enableError.message}`);
      }
    }
    imported += 1;
    existingQuestionTexts.add(question.question_text.trim());
  }

  console.log(`Imported ${imported} validated questions from ${source}; skipped ${skipped} exact duplicates.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
