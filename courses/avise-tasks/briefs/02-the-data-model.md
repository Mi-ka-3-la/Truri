# Module 2: The Data Model

## Teaching Arc
- **Metaphor:** A library checkout card — it records who borrowed the book (assignedTo), when it must be returned (dueDate), who approves returns (reviewerId), and what the current status is (checked out / returned / overdue). Every task is a checkout card for a piece of accounting work.
- **Opening hook:** "When a task appears on your screen, it is not just a line in a table — it is a carefully structured record with fields for the owner, the reviewer, the account it covers, the deadline, and a snapshot of the account balance when work was last submitted."
- **Key insight:** The data model reveals what the product CAN do. The `balanceWhenLastPrepared` field is proof that the system automatically detects when new transactions invalidate completed work. You would not know this feature exists just from looking at the UI.
- **"Why should I care?":** When directing an AI to add a new task field or feature, knowing the schema lets you give precise instructions instead of vague descriptions.

## Code Snippets (pre-extracted)

**File: avise-domains/prisma/schema.prisma (lines 1168-1220)** — the full Task model
```prisma
model Task {
  id        String  @id @default(cuid())
  companyId String  @map(name: "company_id")
  company   Company @relation(fields: [companyId], references: [id])
  periodId  String  @map(name: "period_id")
  period    Period  @relation(fields: [periodId], references: [id])

  title       String
  description String   @default("")
  dueDate     DateTime @map(name: "due_date") @db.Date
  createdBy   String?  @map(name: "created_by")
  creator     User?    @relation("tasksCreated", fields: [createdBy], references: [id])
  assignedTo  String?  @map(name: "assigned_to")
  assignee    User?    @relation("tasksAssigned", fields: [assignedTo], references: [id])
  reviewerId  String?  @map(name: "reviewer_id")
  reviewer    User?    @relation("tasksReviewer", fields: [reviewerId], references: [id])

  taskType           TaskType        @map("task_type")
  category           String?
  accountId          String?         @map(name: "account_id")
  account            Account?        @relation(fields: [accountId], references: [id])
  includeSubAccounts Boolean         @default(false) @map(name: "include_sub_accounts")
  fluxComparison     FluxComparison? @map(name: "flux_comparison")

  accounts TaskAccounts[]

  status            TaskStatus
  resolution        String?
  files             FileLinks[]
  statusUpdatedAt   DateTime    @default(dbgenerated("clock_timestamp()")) @map(name: "status_updated_at")
  autoReviewEnabled Boolean?    @map(name: "auto_review_enabled")

  recurringTaskId String?        @map("recurring_task_id")
  recurringTask   RecurringTask? @relation("recurring_task", fields: [recurringTaskId], references: [id])

  balanceWhenLastPrepared  Int?   @default(0) @map(name: "balance_when_last_prepared")
  reconciliationMethod     ReconciliationMethod? @map("reconciliation_method")

  taskEvents TaskEvent[]
  messages   Message[]
}
```

## Interactive Elements

- [x] **Anchor screen (Pattern A):** the checkout-card metaphor. Use an icon-label row layout with `user` (assignedTo), `user-check` (reviewerId), `calendar` (dueDate), `circle-dot` (status), `landmark` (accountId), `activity` (balanceWhenLastPrepared) Lucide icons. Brief one-liner for each field.

- [x] **Mechanism screen (Pattern B):** code↔English translation of the Task model (snippet 1). Translate the key fields in groups: identity fields (id, companyId, periodId), people fields (assignedTo, reviewerId), work fields (status, resolution), and the smart fields (balanceWhenLastPrepared, autoReviewEnabled). Callout: "balanceWhenLastPrepared is the system's memory — it is a snapshot taken when the preparer submits. If the account balance changes after that, the system knows to reopen the task."

- [x] **Mechanism screen (Pattern B):** visual file tree showing how a task connects to Period, Account, User, RecurringTask, TaskEvent, and Message. Use a relationship diagram built from icon-rows. Each row: Lucide icon + relation name + brief description of why the link exists.

- [x] **Application screen (Pattern C):** quiz, 2 questions:
  1. Scenario: "An account gets new journal entries after the preparer marked the task as prepared. How does the system know to reopen the task?" (balanceWhenLastPrepared stores the balance at prepare time; system compares current balance to this)
  2. Architecture: "A task has both assignedTo and reviewerId. Why doesn't a single person field work?" (the two-role model separates doing from verifying — same separation of duties required by accounting standards)

- [x] **Data flow animation:** actors: Preparer → Task Record → Account → ReviewerField. Steps show data flowing into a task when it is created and updated.

## Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Code ↔ English Translation Blocks", "Multiple-Choice Quizzes", "Icon-Label Rows", "Visual File Tree", "Icons (Lucide)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

## Connections
- **Previous module:** Module 1 (The Close Process) — introduced the 4 task types and the chapter-book metaphor. This module zooms into the data structure behind those types.
- **Next module:** Module 3 (The Lifecycle) — will show how the status field changes over time, including the code that drives status transitions.
- **Tone/style notes:** Accent amber. Module uses `background: var(--color-bg-warm)` (even module). Lucide icons only, no emoji. Term tooltips on: Prisma, schema, relation, foreign key, nullable, enum, CUID.
