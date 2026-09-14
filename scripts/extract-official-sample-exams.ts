import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { questionImportSchema } from "../src/schemas/quiz";

type SourceDefinition = {
  code: string;
  title: string;
  questionFile: string;
  answerFile: string;
  skipQuestions?: number[];
  style: "istqb" | "astqb";
};

type ExtractedQuestion = {
  question_text: string;
  required_selections: number;
  explanation: string;
  source_reference: string;
  answers: { answer_text: string; correct: boolean }[];
};

const officialDirectory = resolve(process.cwd(), "knowledge database/sample exams/official");
const outputFile = resolve(process.cwd(), "knowledge database/imported/official-sample-exams-additional.json");

const sources: SourceDefinition[] = [
  {
    code: "ASTQB-2018-2",
    title: "ASTQB Certified Tester Foundation Level Sample Exam 2 (2018)",
    questionFile: "1. Foundation-2018-Sample-Exam-2-Questions.pdf",
    answerFile: "1. Foundation-2018-Sample-Exam-2-Answer-Table.pdf",
    style: "astqb"
  },
  {
    code: "ISTQB-2018-A",
    title: "ISTQB CTFL Sample Exam A v1.7 (2022), compatible with syllabus 2018 v3.1",
    questionFile: "2. ISTQB-CTFL-2018v3.1_Sample-Exam-A-Questions_v1.7.pdf",
    answerFile: "2. ISTQB-CTFL-2018v3.1_Sample-Exam-A-Answers_v1.7.pdf",
    skipQuestions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    style: "istqb"
  },
  {
    code: "ISTQB-2018-B",
    title: "ISTQB CTFL Sample Exam B v1.4 (2022), compatible with syllabus 2018 v3.1",
    questionFile: "3. ISTQB-CTFL-2018v3.1_Sample-Exam-B-Questions_v1.4.pdf",
    answerFile: "3. ISTQB-CTFL-2018v3.1_Sample-Exam-B-Answers_v1.4.pdf",
    style: "istqb"
  },
  {
    code: "ISTQB-2018-C",
    title: "ISTQB CTFL Sample Exam C v1.3 (2022), compatible with syllabus 2018 v3.1",
    questionFile: "4. ISTQB-CTFL-2018v3.1_Sample-Exam-C-Questions_v1.3.pdf",
    answerFile: "4. ISTQB-CTFL-2018v3.1_Sample-Exam-C-Answers_v1.3.pdf",
    style: "istqb"
  }
];

// pdftotext's raw reading order is best for prose, but it intentionally
// collapses table columns. These source-faithful display overrides retain the
// original facts while presenting tabular material readably on small screens.
const questionTextOverrides: Record<string, string> = {
  "ISTQB-2018-C:31": [
    "You are testing a mobile app that allows users to find a nearby restaurant, based on the type of food they want to eat.",
    "",
    "Consider the following list of test cases, priorities (smaller number is high priority), and dependencies:",
    "",
    "Test case 01.001",
    "Condition: Select type of food",
    "Priority: 3 · Dependency: none",
    "",
    "Test case 01.002",
    "Condition: Select restaurant",
    "Priority: 2 · Dependency: 01.001",
    "",
    "Test case 01.003",
    "Condition: Get directions",
    "Priority: 1 · Dependency: 01.002",
    "",
    "Test case 01.004",
    "Condition: Call restaurant",
    "Priority: 1 · Dependency: 01.002",
    "",
    "Which of the following is a possible test execution schedule that considers both priorities and dependencies?"
  ].join("\n")
};

// A small number of published answer keys contain editorial contradictions.
// Keep the official answer choice, but replace an internally inconsistent
// rationale with a source-grounded explanation of the supplied question data.
const explanationOverrides: Record<string, string> = {
  "ISTQB-2018-C:31": [
    "Test 01.001 must run before 01.002 to satisfy their dependency.",
    "After 01.002, tests 01.003 and 01.004 may run in either order because they have equal priority and both depend on 01.002.",
    "Therefore, option b is correct. Options a and d refer to undefined test case 01.005, while option c violates the dependencies."
  ].join(" ")
};

const boilerplatePatterns = [
  /^\s*Certified Tester,? Foundation Level\s*$/i,
  /^\s*Sample Exam set [A-Z]\s*$/i,
  /^\s*Sample Exam [–-] (?:Questions|Answers)\s*$/i,
  /^\s*Version \S+\s+Page \d+ of \d+.*$/i,
  /^\s*© .*Qualifications Board\s*$/i,
  /^\s*Question\s+Correct.*$/i,
  /^\s*Question\s+Answer\s+Rationale.*$/i,
  /^\s*(?:Question|Correct|Answer|K-Level Number)\s*$/i,
  /^\s*(?:Number|Objective|K-Level|Points|of|\(#\)|\(LO\))\s*$/i,
  /^\s*Explanation \/ Rationale.*$/i,
  /^\s*Learning\s*$/i
];

function pdfText(file: string) {
  return execFileSync("pdftotext", ["-raw", resolve(officialDirectory, file), "-"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  }).replace(/\r/g, "");
}

function cleanLines(lines: string[]) {
  return lines
    .map((line) => line.replace(/\f/g, "").trim())
    .filter((line) => line && !boilerplatePatterns.some((pattern) => pattern.test(line)));
}

function prose(lines: string[]) {
  return cleanLines(lines)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:?!])/g, "$1")
    .trim();
}

function parseQuestions(text: string) {
  const lines = text.split("\n");
  const markers = lines.flatMap((line, index) => {
    const match = line.replace(/\f/g, "").trim().match(/^Question #(\d+) \(1 (?:Point|pt)\)$/i);
    return match ? [{ number: Number(match[1]), index }] : [];
  });

  return markers.map((marker, markerIndex) => {
    const end = markers[markerIndex + 1]?.index ?? lines.length;
    let block = lines.slice(marker.index + 1, end);
    const selectIndex = block.findIndex((line) => /^Select ONE option\.$/i.test(line.trim()));
    if (selectIndex >= 0) block = block.slice(0, selectIndex);
    block = cleanLines(block);

    const allOptionMarkers = block.flatMap((line, index) => {
      const match = line.match(/^([a-d])[.)]\s*(.*)$/);
      return match ? [{ letter: match[1], firstText: match[2], index }] : [];
    });
    let optionMarkers = allOptionMarkers;
    if (allOptionMarkers.length > 4) {
      for (let index = allOptionMarkers.length - 4; index >= 0; index -= 1) {
        const candidate = allOptionMarkers.slice(index, index + 4);
        if (candidate.map((item) => item.letter).join("") === "abcd") {
          optionMarkers = candidate;
          break;
        }
      }
    }

    if (optionMarkers.map((item) => item.letter).join("") !== "abcd") {
      throw new Error(`Question ${marker.number} has an invalid extracted answer sequence.`);
    }

    const questionText = prose(block.slice(0, optionMarkers[0].index));
    const answers = optionMarkers.map((option, optionIndex) => {
      const optionEnd = optionMarkers[optionIndex + 1]?.index ?? block.length;
      return prose([option.firstText, ...block.slice(option.index + 1, optionEnd)]);
    });

    return { number: marker.number, questionText, answers };
  });
}

function findSequentialAnswerMarkers(text: string) {
  const lines = text.split("\n");
  const start = Math.max(0, lines.findLastIndex((line) => line.trim() === "Answers"));
  const candidates = lines.slice(start);
  const markers: { number: number; letter: string; firstText: string; index: number }[] = [];
  let expected = 1;

  for (let index = 0; index < candidates.length; index += 1) {
    const line = candidates[index].replace(/\f/g, "").trim();
    const match = line.match(/^(\d+)\s+([a-dA-D])\s+(.*)$/);
    if (match && Number(match[1]) === expected) {
      markers.push({ number: expected, letter: match[2].toLowerCase(), firstText: match[3], index });
      expected += 1;
    }
  }

  return { lines: candidates, markers };
}

function stripAnswerMetadata(lines: string[]) {
  return cleanLines(lines).filter((line) => !/^(?:FL[- .]|Keyword).*\s(?:K[123]\s+)?\d+$/i.test(line));
}

function extractIstqbReason(rationale: string, correctLetter: string) {
  const thusIndex = rationale.search(/\s+Thus:\s*/i);
  if (thusIndex > 0 && !/^[a-d]\)\s+/i.test(rationale)) {
    const groundedPreamble = rationale.slice(0, thusIndex).trim();
    if (groundedPreamble.length >= 20) return groundedPreamble;
  }

  const optionPattern = /\b([a-d])\)\s+Is\s+(not\s+)?correct\.?\s*/gi;
  const markers = [...rationale.matchAll(optionPattern)];
  const correctIndex = markers.findIndex(
    (marker) => marker[1].toLowerCase() === correctLetter && !marker[2]
  );
  if (correctIndex < 0) return rationale;

  const correctMarker = markers[correctIndex];
  const correctEnd = correctMarker.index! + correctMarker[0].length;
  const nextMarkerIndex = markers[correctIndex + 1]?.index ?? rationale.length;
  const directReason = rationale.slice(correctEnd, nextMarkerIndex).trim();
  const directReasonIsWeak = directReason.length < 15 || /see reasons from incorrect answers/i.test(directReason);
  if (!directReasonIsWeak) return directReason;

  const alternativeReasons = markers
    .filter((marker) => Boolean(marker[2]))
    .map((marker) => {
      const start = marker.index! + marker[0].length;
      const markerPosition = markers.indexOf(marker);
      const end = markers[markerPosition + 1]?.index ?? rationale.length;
      const reason = rationale.slice(start, end).trim();
      return /[.!?]$/.test(reason) ? reason : `${reason}.`;
    })
    .filter((reason) => reason.length >= 8);

  if (alternativeReasons.length > 0) {
    return `The official rationale rules out the alternatives: ${alternativeReasons.join(" ")}`;
  }
  return directReason;
}

function extractAstqbReason(rationale: string, correctLetter: string) {
  const withoutLead = rationale.replace(
    new RegExp(`^${correctLetter} is correct(?:, per syllabus)?\\.\\s*`, "i"),
    ""
  );
  const incorrectOption = withoutLead.search(/\s+[A-D](?:\s+and\s+[A-D]){0,3}\s+(?:is|are)\s+(?:not correct|incorrect)/);
  return (incorrectOption >= 0 ? withoutLead.slice(0, incorrectOption) : withoutLead).trim();
}

function parseAnswers(text: string, style: SourceDefinition["style"]) {
  const { lines, markers } = findSequentialAnswerMarkers(text);
  if (markers.length !== 40) throw new Error(`Expected 40 answer-key entries, found ${markers.length}.`);

  return markers.map((marker, markerIndex) => {
    const end = markers[markerIndex + 1]?.index ?? lines.length;
    const rationale = prose(stripAnswerMetadata([
      marker.firstText,
      ...lines.slice(marker.index + 1, end)
    ]));
    const reason = style === "istqb"
      ? extractIstqbReason(rationale, marker.letter)
      : extractAstqbReason(rationale, marker.letter);

    return {
      number: marker.number,
      correctLetter: marker.letter,
      reason: reason.replace(/\s+/g, " ").trim()
    };
  });
}

function qualityIssue(question: { questionText: string; answers: string[] }, reason: string) {
  if (!question.questionText || question.questionText.length < 12) return "question text is too short";
  if (question.questionText.length > 2_200) return "question text is too long for reliable display";
  if (question.answers.some((answer) => !answer || answer.length < 1)) return "an answer is empty";
  if (question.answers.some((answer) => answer.length > 900)) return "an answer contains an unreadable extracted table";
  if (!reason || reason.length < 8) return "official rationale extraction is too short";
  if (/(?:^|\s)[a-d]\)\s+Is not correct|Question Correct|K-Level Number/i.test(reason)) {
    return "official rationale extraction contains answer-table artifacts";
  }
  if (/\b(?:figure|diagram)\s+(?:below|above)\b/i.test(question.questionText)) return "depends on a figure not represented in the database";
  return null;
}

async function main() {
  const questions: ExtractedQuestion[] = [];
  const excluded: { source: string; question: number; reason: string }[] = [];
  const sourceSummary: Record<string, { included: number; excluded: number; skippedExisting: number }> = {};

  for (const source of sources) {
    const parsedQuestions = parseQuestions(pdfText(source.questionFile));
    const parsedAnswers = parseAnswers(pdfText(source.answerFile), source.style);
    if (parsedQuestions.length !== 40) {
      throw new Error(`${source.code}: expected 40 questions, found ${parsedQuestions.length}.`);
    }

    const answerMap = new Map(parsedAnswers.map((answer) => [answer.number, answer]));
    sourceSummary[source.code] = { included: 0, excluded: 0, skippedExisting: 0 };

    for (const question of parsedQuestions) {
      if (source.skipQuestions?.includes(question.number)) {
        sourceSummary[source.code].skippedExisting += 1;
        continue;
      }

      const key = answerMap.get(question.number);
      if (!key) throw new Error(`${source.code} question ${question.number}: answer key is missing.`);
      const correctIndex = key.correctLetter.charCodeAt(0) - 97;
      if (correctIndex < 0 || correctIndex >= question.answers.length) {
        throw new Error(`${source.code} question ${question.number}: answer key is out of range.`);
      }

      const displayQuestion = {
        ...question,
        questionText: questionTextOverrides[`${source.code}:${question.number}`] ?? question.questionText
      };
      const issue = qualityIssue(displayQuestion, key.reason);
      if (issue) {
        excluded.push({ source: source.code, question: question.number, reason: issue });
        sourceSummary[source.code].excluded += 1;
        continue;
      }

      const sourceReference = `${source.title}, question ${question.number}`;
      questions.push({
        question_text: displayQuestion.questionText,
        required_selections: 1,
        explanation: `${explanationOverrides[`${source.code}:${question.number}`] ?? key.reason} Source: ${sourceReference}, official answer rationale${explanationOverrides[`${source.code}:${question.number}`] ? " corrected where the published rationale contradicts its marked answer and question data" : ""}.`,
        source_reference: sourceReference,
        answers: question.answers.map((answerText, index) => ({
          answer_text: answerText,
          correct: index === correctIndex
        }))
      });
      sourceSummary[source.code].included += 1;
    }
  }

  const document = {
    metadata: {
      purpose: "Additional source-grounded questions for ISTQB for ninjas",
      generated_from: sources.map((source) => ({
        source: source.title,
        questions_pdf: `knowledge database/sample exams/official/${source.questionFile}`,
        answers_pdf: `knowledge database/sample exams/official/${source.answerFile}`
      })),
      supporting_reference: "knowledge database/sample exams/official/ISTQB_CTFL_Syllabus_v4.0.1.pdf",
      notes: "Questions and correct answers are extracted from official sample exams and answer keys. The v4.0.1 syllabus is retained as the current authoritative concept reference. No questions were synthesized from unsupported material.",
      excluded
    },
    questions
  };

  const validation = questionImportSchema.safeParse(document);
  if (!validation.success) {
    console.error(validation.error.format());
    throw new Error("Generated question document failed import validation.");
  }

  await writeFile(outputFile, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    output: outputFile,
    generatedQuestions: questions.length,
    excludedQuestions: excluded.length,
    sourceSummary,
    excluded
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
