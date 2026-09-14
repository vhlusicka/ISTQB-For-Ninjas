# Codex materials guide

This folder is the authoritative entry point for question material used by **ISTQB for ninjas**.

## Required workflow

1. Always inspect this folder first and search every subdirectory.
2. Never invent an exam question, answer, or source claim.
3. Never guess a correct answer. Flag uncertain material for human review instead.
4. Preserve the meaning of every question and preserve the original answer order.
5. Identify single-answer and multi-answer questions from the source instructions. Set `required_selections` accordingly.
6. Create explanations during import, grounded in the supplied rationale or syllabus. Do not create explanations at exam runtime.
7. Validate the intermediate JSON before inserting anything into the database.

## Directory structure

```text
knowledge database/
├── CODEX_MATERIALS_GUIDE.md
├── imported/
│   └── questions.json
└── sample exams/
    ├── official/
    └── supplementary/
```

- `sample exams/official/` contains material published by ISTQB and receives the highest priority.
- `sample exams/supplementary/` contains third-party practice material. Verify it against official sources before importing it.
- `imported/` contains reviewed, validated intermediate data ready for database import.

## Source priority

1. Official ISTQB sample examinations
2. Official ISTQB answer keys
3. Official ISTQB CTFL syllabus
4. Other supplied ISTQB learning material
5. Manually prepared material in this folder

## Import format

Store reviewed imports in `imported/` using the format documented in the project README. Invalid or uncertain questions must not be enabled.

The initial reviewed dataset in `imported/questions.json` comes from the official **ISTQB Certified Tester Foundation Level Sample Exam set A, version 1.7 (2022)** question and answer PDFs in `sample exams/official/`.

The expanded dataset in `imported/official-sample-exams-additional.json` is reproducibly extracted from all four official question-and-answer pairs in `sample exams/official/`. It excludes the first ten Set A questions already present in the initial dataset. Each entry includes its exact source reference, and its explanation comes from the corresponding official answer rationale. The supplied CTFL v4.0.1 syllabus is recorded as the current supporting concept reference; no unsupported questions are synthesized from it.
