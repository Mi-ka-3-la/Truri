# Module 3: The Lifecycle

## Teaching Arc
- **Metaphor:** A relay race — the baton (the task status) passes from the preparer to the reviewer and potentially back. No runner finishes until the baton crosses the line in the right person's hands. If the reviewer spots a problem, they pass the baton back.
- **Opening hook:** "When a preparer clicks 'Mark as Prepared', the task does not just change color — the system atomically records a new status AND creates an audit event in a single database write."
- **Key insight:** Status changes are never just field updates. Every transition simultaneously records WHY it happened (the event payload), WHO triggered it, and WHEN. The TaskEvent log is the system's memory.
- **"Why should I care?":** When debugging "why did this task get reopened?", you look at taskEvents — not the current status. This is where all the history lives.

## Code Snippets (pre-extracted)

**File: avise-api/src/data/tasks/index.ts (lines 1165-1199)** — setTaskStatusAndEvent
```ts
function setTaskStatusAndEvent(
  companyId: string,
  taskId: string,
  status: TaskStatus,
  eventPayload: TaskEventPayload,
): PrismaPromise<PrismaTask> {
  logger.debug("Reopening task", {
    companyId,
    taskId,
    status,
    eventPayload,
  });

  const eventPayloadJsonObject: JsonObject = { ...eventPayload, status } as JsonObject;

  return prisma.task.update({
    where: {
      companyId_id: {
        companyId,
        id: taskId,
      },
    },
    data: {
      status,
      statusUpdatedAt: getCurrentSystemJsDateTime(),
      autoReviewEnabled: false,
      taskEvents: {
        create: {
          type: TaskEventType.system_task_update,
          eventPayload: eventPayloadJsonObject,
        },
      },
    },
  });
}
```

## Interactive Elements

- [x] **Anchor screen (Pattern A):** relay race metaphor. Flow diagram (horizontal steps): `unprepared` → `in_progress` → `prepared` → `reviewed`. Show the `reopened` branch looping back from reviewer to preparer. Use numbered step cards — each step names the actor (Preparer / Reviewer / System).

- [x] **Mechanism screen (Pattern B):** code↔English translation of `setTaskStatusAndEvent` (snippet 1). Key insight to highlight: the Prisma `update` call atomically sets the status AND creates a new TaskEvent in ONE database operation. Callout: "Atomic writes = no partial failures. If the event creation fails, the status does NOT change. The database guarantees both happen together or neither does — exactly what audit trails need."

- [x] **Mechanism screen (Pattern B):** group chat animation — actors: Preparer, System (API), Database. Conversation: Preparer clicks "Mark as prepared" → System receives the request → System calls setTaskStatusAndEvent → Database writes status + creates event in one transaction → System confirms → Preparer sees the updated status. 5-6 messages.

- [x] **Application screen (Pattern C):** quiz, 2 questions:
  1. Debugging: "A task went from 'prepared' back to 'unprepared' and nobody knows why. Where in the codebase would you look first to find the reason?" (taskEvents — the audit log records why every status change happened)
  2. Scenario: "You want to add a new status 'pending_external_approval' to the task workflow. Which files need to change, and in what order?" (schema → enum → data layer → service layer — schema first because everything else depends on it)

- [x] **Data flow animation (hero visual):** actors: Browser, API Server, Prisma, PostgreSQL. Steps: click → API route → setTaskStatusAndEvent → Prisma UPDATE + CREATE in one transaction → DB confirms → response back to browser. Emphasizes the atomic nature.

## Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Code ↔ English Translation Blocks", "Group Chat Animation", "Message Flow / Data Flow Animation", "Multiple-Choice Quizzes", "Flow Diagrams", "Numbered Step Cards", "Icons (Lucide)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

## Connections
- **Previous module:** Module 2 (The Data Model) — introduced the status field and taskEvents. This module shows those fields moving.
- **Next module:** Module 4 (Recurring Tasks) — introduces RecurringTask, the template that auto-creates tasks each period.
- **Tone/style notes:** Accent amber. Module uses `background: var(--color-bg)` (odd). Chat window actors: "P" for Preparer (amber/actor-4), "S" for System (teal/actor-2), "D" for Database (plum/actor-3). Tooltips on: atomic, transaction, Prisma, ORM, payload, audit trail.
