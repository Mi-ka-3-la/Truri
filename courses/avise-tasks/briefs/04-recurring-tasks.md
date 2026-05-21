# Module 4: Recurring Tasks

## Teaching Arc
- **Metaphor:** A TV show series — the RecurringTask is the show's format (title, cast, production schedule), and each period generates a new episode. The episodes are independent but share the same DNA. Cancel the series and future episodes stop; past episodes stay archived.
- **Opening hook:** "Most tasks in Avise are not created manually. They are automatically generated each month from a recurring task template — like a standing meeting invitation that produces a new calendar event every month without anyone clicking 'Create'."
- **Key insight:** The RecurringTask model separates WHAT needs to happen (the template) from WHEN it happens (the generated Task instances). This lets admins configure once and the system handles the rest indefinitely.
- **"Why should I care?":** If the AI generates code that creates tasks one-by-one for each period, that's wrong architecture. The right approach uses recurring task templates — and now you can recognize and correct that.

## Code Snippets (pre-extracted)

**File: avise-domains/prisma/schema.prisma (lines 1638-1680)** — RecurringTask model
```prisma
model RecurringTask {
  id        String  @id @default(cuid())
  companyId String  @map(name: "company_id")
  company   Company @relation(fields: [companyId], references: [id])

  title                     String
  description               String    @default("")
  assignedTo                String?   @map(name: "assigned_to")
  assignee                  User?     @relation("recurringTasksAssigned", ...)
  reviewerId                String?   @map(name: "reviewer_id")
  reviewer                  User?     @relation("recurringTasksReviewer", ...)
  startDate                 DateTime  @map("start_date") @db.Date
  endDate                   DateTime? @map("end_date") @db.Date
  createDaysBeforePeriodEnd Int?      @map("create_days_before_period_end")
  frequency                 Frequency @default(monthly)
  reconciliationMethod      ReconciliationMethod? @map("reconciliation_method")
  daysFrom                  Int       @map("days_from")
  relativeTo                RelativeTo @map("relative_to")
  taskType                  TaskType  @map("task_type")
  category                  String?
  accountId                 String?   @map(name: "account_id")
  account                   Account?  @relation(...)
  includeSubAccounts        Boolean   @default(false) @map(name: "include_sub_accounts")

  recurringTaskEvents RecurringTaskEvent[]
  tasks Task[] @relation("recurring_task")
}
```

**File: avise-domains/prisma/schema.prisma (lines 1133-1138)** — Frequency enum
```prisma
enum Frequency {
  monthly
  quarterly
  yearly

  @@map(name: "frequency")
}
```

## Interactive Elements

- [x] **Anchor screen (Pattern A):** TV series metaphor — icon-label row showing RecurringTask (the "show format") vs Task instances (the "episodes"). Use Lucide icons: `repeat` for recurring task, `play-circle` for task instance, `calendar` for period. Pattern cards showing what the template configures vs what each instance inherits.

- [x] **Mechanism screen (Pattern B):** code↔English translation of the RecurringTask model (snippet 1). Focus on: startDate/endDate (the series run dates), frequency (how often), daysFrom + relativeTo (how the due date is calculated for each episode), and the `tasks` relation (the list of all generated episodes). Callout: "daysFrom + relativeTo is a formula, not a hardcoded date. '5 days before period end' always produces the right due date no matter what month it is — the system calculates it fresh each time."

- [x] **Mechanism screen (Pattern B):** data flow animation — actors: Admin, RecurringTask Template, Period System, Task Instance. Steps: admin saves recurring task → period opens → system reads templates → computes due date from daysFrom + relativeTo → creates Task instances → assigns to preparer.

- [x] **Mechanism screen (Pattern B):** group chat showing RecurringTask and Task Instance talking: "I'm your template. You have my title, assignee, and task type." / "I'm an individual instance. I have my own status, my own resolution, my own due date."

- [x] **Application screen (Pattern C):** quiz, 2 questions:
  1. Scenario: "Your company needs monthly reconciliation tasks for 50 accounts. Would you create 50 × 12 = 600 individual tasks, or set up 50 recurring task templates?" (templates — this is exactly what RecurringTask is designed for)
  2. Debugging: "A recurring task template has endDate set to 2024-12-31. New tasks stop generating after December 2024. Why?" (endDate controls when the series stops — set it or leave it null for no end date)

## Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Code ↔ English Translation Blocks", "Group Chat Animation", "Message Flow / Data Flow Animation", "Multiple-Choice Quizzes", "Pattern/Feature Cards", "Icons (Lucide)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

## Connections
- **Previous module:** Module 3 (The Lifecycle) — showed how individual task status changes. This module steps back to show where tasks come from in the first place.
- **Next module:** Module 5 (Auto-Review) — introduces the threshold-based system that can automatically mark tasks as reviewed without human intervention.
- **Tone/style notes:** Accent amber. Module uses `background: var(--color-bg-warm)` (even). Chat: "RT" for RecurringTask (amber), "TI" for Task Instance (teal). Tooltips on: template, instance, frequency, cron, due date formula, RecurringTask.
