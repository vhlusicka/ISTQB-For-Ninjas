# ISTQB for ninjas

## Product & Software Specification

---

# 1. Product Overview

Build a lightweight responsive web application called:

**ISTQB for ninjas**

The application is intended for practicing ISTQB Certified Tester Foundation Level (CTFL) exam questions.

The product name must be used consistently in:

* browser page title
* website header
* metadata
* README
* application branding
* future login/registration pages

The application will store questions and answers in a PostgreSQL database and generate randomized practice exams containing a user-selected number of questions.

The initial version does NOT require user accounts, but the architecture must allow registration/login and user-specific statistics to be added later.

The application must work well on:

* Desktop
* Tablet
* Smartphone

It must support:

* Light mode
* Dark mode
* System theme

The application should be optimized primarily for ISTQB CTFL v4.0 / syllabus v4.0.1.

The application must NOT invent exam questions or answers.

All question content must originate from material stored in the project's:

```text
knowledge database/
```

folder.

---

# 2. Main User Flow

The primary user flow is:

1. Open **ISTQB for ninjas**.
2. Select the desired number of questions.
3. Click `START`.
4. Answer the randomly selected questions.
5. Navigate between questions.
6. Click `FINISH THE EXAM`.
7. Submit answers.
8. View:

   * score
   * percentage
   * PASS / NOT PASSED status
   * correct answers
   * wrong answers
   * unanswered questions
   * short explanations for incorrectly answered questions
9. Click `BACK TO START`.
10. Return to the first page and choose the number of questions for a new exam.

---

# 3. Technology Stack

Use:

## Application

* Next.js
* TypeScript
* React
* Next.js App Router

## UI

* Tailwind CSS
* shadcn/ui where useful
* next-themes

Keep the interface simple, modern and lightweight.

## Database

Use PostgreSQL hosted by Supabase.

Use:

* Supabase PostgreSQL
* `@supabase/supabase-js`
* Supabase migration files
* PostgreSQL constraints
* PostgreSQL foreign keys

Do NOT introduce Prisma unless there is a clear technical reason.

## Validation

Use Zod for:

* API validation
* question import validation
* exam configuration validation
* submitted answer validation

## Testing

Use:

* Vitest
* React Testing Library where appropriate
* Playwright

## Hosting

Application:

* Vercel

Database:

* Supabase

Prefer free tiers.

---

# 4. Application Architecture

Use a single Next.js project.

```text
Browser
   ↓
Next.js application
   ↓
Next.js server/API
   ↓
Supabase PostgreSQL
```

Correct-answer information must never be exposed before exam submission.

---

# 5. Knowledge Database

Create and use:

```text
knowledge database/
```

as the authoritative source of ISTQB material.

Possible contents:

* official ISTQB sample exams
* answer keys
* ISTQB syllabus
* PDFs
* DOCX
* TXT
* Markdown
* JSON
* manually prepared material

Example:

```text
knowledge database/
├── CODEX_MATERIALS_GUIDE.md
├── syllabus/
├── sample exams/
└── imported/
```

---

# 6. CODEX_MATERIALS_GUIDE.md

Create:

```text
knowledge database/CODEX_MATERIALS_GUIDE.md
```

It must tell Codex:

* always inspect `knowledge database/` first
* search all subdirectories
* never invent exam questions
* never guess correct answers
* use official ISTQB material as highest priority
* preserve question meaning
* preserve answer ordering
* identify single-answer and multi-answer questions correctly
* derive explanations from provided ISTQB material
* flag uncertain material rather than guessing

Source priority:

1. Official ISTQB sample examinations
2. Official ISTQB answer keys
3. Official ISTQB CTFL syllabus
4. Other provided ISTQB learning material
5. Manually prepared material in the folder

---

# 7. Database

Initially use exactly two application tables:

1. `questions`
2. `answers`

---

# 8. Questions Table

```text
questions
```

Columns:

| Column              | Type               | Description                             |
| ------------------- | ------------------ | --------------------------------------- |
| id                  | BIGINT identity PK | Sequential question ID                  |
| question_text       | TEXT               | Question text                           |
| required_selections | SMALLINT           | Number of answers user must select      |
| explanation         | TEXT               | Short explanation of the correct answer |
| enabled             | BOOLEAN            | Whether question can appear             |
| date_added          | TIMESTAMPTZ        | Creation timestamp                      |
| date_edited         | TIMESTAMPTZ        | Last modification timestamp             |

Defaults:

```text
enabled = true
date_added = now()
date_edited = now()
```

`required_selections >= 1`

---

# 9. Answers Table

```text
answers
```

Columns:

| Column      | Type               | Description               |
| ----------- | ------------------ | ------------------------- |
| id          | BIGINT identity PK | Sequential answer ID      |
| question_id | BIGINT FK          | Connected question        |
| answer_text | TEXT               | Answer text               |
| correct     | BOOLEAN            | Whether answer is correct |

Foreign key:

```text
answers.question_id -> questions.id
```

Use:

```text
ON DELETE CASCADE
```

---

# 10. Question Type

Question type derives from:

```text
required_selections
```

Example:

```text
required_selections = 1
```

means:

> Select ONE answer.

Use radio buttons.

Example:

```text
required_selections = 2
```

means:

> Select TWO answers.

Use checkboxes.

No separate question-type column is required.

---

# 11. Data Integrity

The number of:

```text
correct = true
```

answers must equal:

```text
required_selections
```

Every enabled question must have:

* question text
* at least 2 answers
* at least 1 correct answer
* valid `required_selections`
* correct answer count matching `required_selections`
* usable explanation

---

# 12. Answer Ordering

Preserve original source answer order.

Generate labels dynamically:

```text
A
B
C
D
...
```

Do not store these labels in SQL.

Do not randomly reorder answers.

Questions may be randomized.

---

# 13. Home Page

The home page must prominently display:

**ISTQB for ninjas**

Include:

* application name/logo area
* theme switch
* number-of-questions selector
* available-question count
* START button

Suggested options:

```text
5
10
20
40
```

Custom number may also be supported.

---

# 14. Starting an Exam

When START is clicked:

1. Validate number of questions.
2. Select only enabled questions.
3. Randomly choose unique questions.
4. Load associated answers.
5. Do not return `correct`.
6. Do not return `explanation`.
7. Randomize question order.
8. Preserve answer order.

---

# 15. Exam Screen

Display:

```text
Question 4 of 20
```

Then:

* question text
* selection instruction
* answers
* navigation controls

Example:

```text
Select ONE answer.
```

or:

```text
Select TWO answers.
```

---

# 16. Single-Answer Questions

For:

```text
required_selections = 1
```

use radio buttons.

Only one answer can be selected.

---

# 17. Multiple-Answer Questions

For:

```text
required_selections > 1
```

use checkboxes.

The user must not select more answers than allowed.

---

# 18. Navigation

Provide:

```text
PREVIOUS
NEXT
```

Selections must remain saved while navigating.

The user can change selections until submitting the exam.

Do not reveal correct answers during the exam.

---

# 19. Finish Exam

Provide:

```text
FINISH THE EXAM
```

If unanswered questions exist, show confirmation:

```text
You have 3 unanswered questions.

Are you sure you want to finish the exam?
```

Buttons:

```text
CONTINUE EXAM
FINISH THE EXAM
```

After confirmation, answers become final.

---

# 20. Scoring

All scoring must happen server-side.

For each question:

* retrieve actual correct answer IDs
* compare against selected answer IDs
* require an exact match

Multiple-answer questions receive no partial credit.

---

# 21. Results

Display:

```text
RESULT

16 / 20
80%
PASS
```

or:

```text
11 / 20
55%
NOT PASSED
```

Also display:

* correct count
* wrong count
* unanswered count
* total questions
* percentage

---

# 22. Pass / Fail

Use a 65% threshold.

Examples:

```text
5 questions  -> 4 correct
10 questions -> 7 correct
20 questions -> 13 correct
40 questions -> 26 correct
```

Custom-length exams should be described as practice simulations.

---

# 23. Answer Review

After submission, show every question.

For each question display:

* question number
* question text
* all answers
* user's selected answer(s)
* correct answer(s)
* status:

  * CORRECT
  * WRONG
  * UNANSWERED

Clearly indicate missed correct answers and incorrectly selected answers.

---

# 24. Explanations

Every question should have an explanation stored in:

```text
questions.explanation
```

For wrong or unanswered questions:

display the explanation automatically.

For correctly answered questions:

an optional:

```text
SHOW EXPLANATION
```

control may be provided.

The application must NOT generate explanations live when the exam finishes.

Explanations must be created during the question-import process and stored in the database.

This provides:

* consistent explanations
* instant results
* no AI/API costs during normal use
* no runtime hallucinations
* easier review and quality control

---

# 25. Generating Explanations During Import

If the source exam contains an explanation:

use that as the basis.

If only an answer key exists:

use the supplied ISTQB syllabus and authoritative material from:

```text
knowledge database/
```

to create a concise explanation.

The explanation must be:

* short
* clear
* directly related to the question
* grounded in provided ISTQB material

If Codex cannot confidently explain the answer:

flag the question for review.

Do not guess.

---

# 26. Back to Start

At the bottom of results display:

```text
BACK TO START
```

Clicking it returns to the first page of **ISTQB for ninjas**.

The user can then start another exam.

---

# 27. Question Import

Preferred intermediate format:

```json
{
  "questions": [
    {
      "question_text": "Example question?",
      "required_selections": 1,
      "explanation": "Short explanation based on ISTQB material.",
      "answers": [
        {
          "answer_text": "Answer A",
          "correct": false
        },
        {
          "answer_text": "Answer B",
          "correct": true
        }
      ]
    }
  ]
}
```

Suggested command:

```bash
npm run import-questions -- "./knowledge database/imported/questions.json"
```

---

# 28. Import Validation

Use Zod.

Validate:

* question text
* minimum answer count
* correct answers
* required selections
* explanation
* malformed values

Invalid imports must fail clearly.

Do not silently insert bad data.

---

# 29. Security

Never expose:

* Supabase service-role key
* database password
* secrets
* correct answers before submission
* explanations before submission

Local secrets:

```text
.env.local
```

Production secrets:

Vercel environment variables.

---

# 30. API

## Start

```text
POST /api/quiz/start
```

Request:

```json
{
  "questionCount": 20
}
```

Return:

* questions
* answer options
* required selections

Do NOT return:

```text
correct
explanation
```

---

## Submit

```text
POST /api/quiz/submit
```

Request:

```json
{
  "answers": [
    {
      "questionId": 123,
      "selectedAnswerIds": [502]
    }
  ]
}
```

Response includes:

* score
* percentage
* pass/fail
* correct count
* wrong count
* unanswered count
* result per question
* correct answers
* explanations

---

# 31. Responsive Design

Use mobile-first design.

Support approximately:

```text
360px+
```

Requirements:

* no horizontal scrolling
* large touch targets
* clickable answer rows
* readable question text
* responsive results
* responsive review screen

---

# 32. Accessibility

Requirements:

* semantic HTML
* keyboard navigation
* visible focus
* proper labels
* accessible radios
* accessible checkboxes
* accessible dialogs
* sufficient contrast

Do not rely only on color.

---

# 33. Theme

Support:

* Light
* Dark
* System

Persist preference locally.

---

# 34. Branding

The official application name is:

**ISTQB for ninjas**

Use this exact wording consistently.

Suggested browser title:

```text
ISTQB for ninjas
```

Suggested exam page title:

```text
ISTQB for ninjas — Practice Exam
```

Suggested results title:

```text
ISTQB for ninjas — Results
```

Do not rename the product without an explicit requirement.

---

# 35. Future Authentication

Do not implement authentication yet.

Keep compatibility with Supabase Auth for:

* registration
* login
* exam history
* statistics
* weak-topic analysis
* bookmarks
* progress tracking

---

# 36. Future Features

Keep compatibility with:

* login/registration
* timed exam simulation
* 60-minute timer
* examination history
* statistics dashboard
* syllabus topics
* K-level classification
* filtering
* repeat wrong questions
* bookmarks
* admin panel
* question editor
* bulk import UI
* source tracking

Do not implement these in the MVP unless requested.

---

# 37. Testing

Unit tests should cover:

* single-answer scoring
* multi-answer scoring
* exact match
* partial answer treated as wrong
* unanswered question
* pass/fail calculation
* validation
* explanation visibility

Playwright E2E tests should cover:

1. Start exam.
2. Correct number of questions loads.
3. Single-answer selection.
4. Multi-answer selection.
5. Navigation.
6. Answers remain selected.
7. Correct answers are hidden.
8. Explanations are hidden.
9. Finish exam confirmation.
10. Unanswered warning.
11. Results display.
12. Review display.
13. Wrong-answer explanation.
14. Back to start.
15. Disabled questions excluded.
16. Mobile layout.

---

# 38. Suggested Structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── quiz/
│   │   └── page.tsx
│   ├── results/
│   │   └── page.tsx
│   └── api/
│       └── quiz/
│           ├── start/
│           │   └── route.ts
│           └── submit/
│               └── route.ts
│
├── components/
│   ├── QuestionCard.tsx
│   ├── AnswerOption.tsx
│   ├── QuizNavigation.tsx
│   ├── QuizProgress.tsx
│   ├── FinishExamDialog.tsx
│   ├── ThemeToggle.tsx
│   ├── ResultSummary.tsx
│   ├── QuestionReview.tsx
│   └── AnswerExplanation.tsx
│
├── lib/
│   ├── supabase/
│   └── quiz/
│
└── schemas/

scripts/
└── import-questions.ts

knowledge database/
├── CODEX_MATERIALS_GUIDE.md
├── syllabus/
├── sample exams/
└── imported/

supabase/
└── migrations/

tests/
├── unit/
└── e2e/
```

---

# 39. Git

Commit:

```text
knowledge database/CODEX_MATERIALS_GUIDE.md
```

Do not commit:

```text
.env.local
```

If copyrighted or private exam material should not enter the repository, ignore the relevant files while retaining the guide.

---

# 40. MVP Definition of Done

The MVP is complete when:

1. The product is branded as **ISTQB for ninjas**.
2. Application runs locally.
3. Supabase database contains the two application tables.
4. Questions are imported from `knowledge database`.
5. `CODEX_MATERIALS_GUIDE.md` exists.
6. Invalid questions are rejected.
7. Enabled questions contain valid explanations.
8. User chooses number of questions.
9. START creates a randomized exam.
10. Questions do not repeat.
11. Disabled questions are excluded.
12. Single-answer questions work.
13. Multiple-answer questions work.
14. Navigation works.
15. Selections persist during navigation.
16. Correct answers remain hidden before submission.
17. Explanations remain hidden before submission.
18. User can click `FINISH THE EXAM`.
19. Unanswered-question warning works.
20. Scoring is server-side.
21. Exact-match scoring works.
22. Results display score.
23. Results display percentage.
24. Results display PASS / NOT PASSED.
25. Results display correct/wrong/unanswered counts.
26. User can review every question.
27. Wrong answers display stored explanations.
28. Explanations are generated during import, never live during exam completion.
29. User can click `BACK TO START`.
30. Application works on smartphones.
31. Light/dark/system modes work.
32. Critical logic has automated tests.
33. Application can deploy to Vercel.
34. Supabase connection is secure.
35. Correct-answer data cannot be retrieved before submission.

Keep **ISTQB for ninjas** simple, fast and easy to maintain.

Do not over-engineer the MVP.
