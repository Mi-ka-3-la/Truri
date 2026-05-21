# Module 1: The Close Process

## Teaching Arc
- **Metaphor:** Closing a chapter of a book — the writer (preparer) drafts and submits each section, the editor (reviewer) approves or sends back. The book is not published until every chapter is marked done. Each accounting period is one chapter.
- **Opening hook:** "You open the Tasks page in Avise and see a list of items to complete this month. But what IS a task? Where does it come from? And what makes it 'done'?"
- **Key insight:** Tasks are the atomic unit of the accounting close process. They give every piece of work a named owner, a due date, a reviewer, and a status — so nothing falls through the cracks.
- **"Why should I care?":** When you ask AI to build new task features, you need to know what types exist and how they differ — otherwise you'll get generic code that misses the domain logic.

## Code Snippets (pre-extracted)

**File: avise-domains/prisma/schema.prisma (lines 1104-1123)** — the status and type enums
```prisma
enum TaskStatus {
  unprepared
  in_progress
  prepared
  reopened
  rejected
  reviewed
  wont_do

  @@map(name: "task_status")
}

enum TaskType {
  account
  reconciliation
  category
  flux

  @@map(name: "task_type")
}
```

**File: avise-domains/src/generated/enums.ts (lines 205-221)** — reconciliation method enum
```ts
export const ReconciliationMethod = {
  PreparedSchedule: 'PreparedSchedule',
  Workpaper: 'Workpaper',
  Dimension: 'Dimension',
  None: 'None',
} as const;

export const TaskType = {
  account: 'account',
  reconciliation: 'reconciliation',
  category: 'category',
  flux: 'flux',
} as const;
```

## Interactive Elements

- [x] **Anchor screen (Pattern A):** pattern cards for the 4 task types (account, reconciliation, category, flux). Each card uses a Lucide icon — use `clipboard-list` for account, `scale` for reconciliation, `tag` for category, `trending-up` for flux. Brief description of what each type checks.

- [x] **Mechanism screen (Pattern B):** code↔English translation of the TaskStatus enum (snippet 1). Highlight that the status tells you exactly where in the lifecycle a task sits. Callout: "A status enum is a vocabulary list — by constraining the values to a known set, the database guarantees no task can ever have a nonsensical state like 'finished' or 'maybe'."

- [x] **Mechanism screen (Pattern B):** flow diagram showing the chapter-closing metaphor: Period Opens → Tasks Created → Worker Prepares → Reviewer Approves → Period Closed. Use 5 numbered step cards.

- [x] **Application screen (Pattern C):** multiple-choice quiz, 2 questions:
  1. Scenario: "You want the system to watch for unusual changes in account balances month-over-month. Which task type is built for this?" (flux)
  2. Scenario: "A preparer submitted their work but a reviewer found an issue. Which status is the task in now?" (reopened)

- [x] **Data flow animation:** actors: Period → Tasks System → Assignee → Reviewer. Steps show period opening triggering task creation, task moving to assignee, then to reviewer, then period closed.

## Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Code ↔ English Translation Blocks", "Multiple-Choice Quizzes", "Message Flow / Data Flow Animation", "Pattern/Feature Cards", "Numbered Step Cards", "Icons (Lucide)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

## Connections
- **Previous module:** none — this is the first module
- **Next module:** Module 2 (The Data Model) — will show the actual database fields of a Task record
- **Tone/style notes:** Accent color is amber. Actor naming: "Preparer" (the person doing the work), "Reviewer" (the person approving), "System" (the backend). Use Lucide icons throughout — no emoji. Module uses `background: var(--color-bg)` (odd module = warm white).
