# Changelog

All notable changes to **ISTQB for ninjas** are documented here.

## [0.1.0] - 2026-09-13

### Added

- Responsive home, practice exam, results, and complete answer-review experiences.
- Randomized unique question selection with preserved answer ordering.
- Radio and checkbox support with enforced selection limits and persistent navigation state.
- Unanswered-question confirmation and 65% pass threshold.
- Server-only exact-match scoring with correct answers and stored explanations revealed after submission.
- Light, dark, and system themes with persisted preference.
- Supabase migration containing the `questions` and `answers` tables, constraints, cascading foreign key, row-level security, and integrity triggers.
- Zod-validated question import command and reviewed official sample dataset.
- Unit and end-to-end test foundations.
- Project README, environment template, materials guide, and `.gitignore`.
- Added and last-edited timestamps for answer records, including an upgrade migration for existing databases.
- Consolidated question sources under `knowledge database/`, separating official and supplementary sample exams.
