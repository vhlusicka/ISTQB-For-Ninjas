# ISTQB for ninjas

**Version 0.1**

A focused, responsive practice-exam application for ISTQB Certified Tester Foundation Level (CTFL) preparation. It provides randomized exams, server-side exact-match scoring, answer review, grounded explanations, and light/dark/system themes.

The browser never receives correct-answer flags or explanations before submission. Without Supabase credentials the app uses a small server-only dataset taken from the supplied official ISTQB sample material, making local UI development immediately usable.

## Stack

- Next.js 15 App Router, React, and TypeScript
- Tailwind CSS and `next-themes`
- Supabase PostgreSQL and `@supabase/supabase-js`
- Zod validation
- Vitest, React Testing Library, and Playwright

## Run locally

Requirements: Node.js 18.17 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Supabase setup

The repository does not include a connected database or database credentials. Until Supabase is configured, the application uses the server-only development questions in `src/lib/quiz/demo-data.ts`.

### 1. Create the database

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard) and create a project.
2. Wait for the project database to finish provisioning.
3. In the project dashboard, open **SQL Editor** and create a new query.
4. Copy the complete contents of each SQL file in `supabase/migrations/` into the query editor and run them in filename order. For a new database, begin with `202609130001_initial_quiz_schema.sql`. For an existing database, run only migrations that have not already been applied.

The migration creates the two application tables, `questions` and `answers`, together with their constraints, indexes, integrity triggers, foreign key, and row-level security configuration.

### 2. Configure application credentials

In the Supabase project settings, obtain:

- the project URL
- the service-role key

Copy the environment template:

```bash
cp .env.example .env.local
```

Set the credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role key is a privileged secret. Never expose it in browser code, share it publicly, or commit `.env.local`. In particular, never rename it with a `NEXT_PUBLIC_` prefix. The application uses this key only inside Next.js server routes.

Restart the development server after changing environment variables:

```bash
npm run dev
```

### 3. Import the initial questions

Run the validated importer from the repository root:

```bash
npm run import-questions -- "./knowledge database/imported/questions.json"
```

The importer validates the complete JSON document before inserting questions. Run the current import only once: version 0.1 does not yet detect duplicate questions automatically.

### 4. Inspect the data

Open **Table Editor** in the Supabase dashboard and select the `public` schema. It contains:

- `questions` — question text, number of required selections, stored explanation, enabled state, and timestamps
- `answers` — ordered answer options, their associated question IDs, `correct` flags, and added/edited timestamps

You can also inspect the content from **SQL Editor**:

```sql
select
  q.id as question_id,
  q.question_text,
  q.required_selections,
  q.enabled,
  a.id as answer_id,
  a.answer_text,
  a.correct
from public.questions q
join public.answers a on a.question_id = q.id
order by q.id, a.id;
```

Correct-answer flags and explanations are visible to database administrators in Supabase, but they are never returned to users before an exam is submitted. Row-level security blocks direct browser access; the Next.js server routes handle question retrieval and scoring.

## Question material

Read [`knowledge database/CODEX_MATERIALS_GUIDE.md`](knowledge%20database/CODEX_MATERIALS_GUIDE.md) before adding content. All source material now lives under the canonical `knowledge database/` directory. Official ISTQB PDFs are in `sample exams/official/`, while third-party practice papers are isolated in `sample exams/supplementary/`. Questions must never be invented or assigned guessed answers.

Import files use this shape:

```json
{
  "questions": [
    {
      "question_text": "Question from supplied material?",
      "required_selections": 1,
      "explanation": "Stored explanation grounded in supplied material.",
      "answers": [
        { "answer_text": "First source answer", "correct": false },
        { "answer_text": "Second source answer", "correct": true }
      ]
    }
  ]
}
```

Zod rejects malformed imports before inserts. Database triggers also prevent enabled questions from having fewer than two answers or a correct-answer count that differs from `required_selections`.

## Deployment

Deploy the Next.js project to Vercel and configure `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` in the Vercel environment settings. Supabase remains the hosted PostgreSQL database.

## Source attribution

The bundled development questions are derived from *ISTQB Certified Tester Syllabus Foundation Level — Sample Exam set A, version 1.7*, © International Software Testing Qualifications Board. They are intended for non-commercial practice with source acknowledgement.
