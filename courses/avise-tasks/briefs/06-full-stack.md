# Module 6: Full Stack — From Click to Database

## Teaching Arc
- **Metaphor:** A package delivery pipeline — each warehouse (layer) opens the box, does its work, and passes it along. The browser is the sender, the controller is the receiving dock, the service is the fulfillment center, the data layer is the warehouse, and PostgreSQL is the vault where the package finally rests.
- **Opening hook:** "You click 'Mark as Prepared' in the browser. In the next 200ms, that click travels through 5 distinct layers of code before the database updates. Here is every handoff."
- **Key insight:** The three-layer architecture (controller → service → data) is not bureaucracy — each layer has a specific job. Controllers handle HTTP concerns. Services handle business rules (should this task REALLY be marked prepared right now?). The data layer handles database queries. Mixing these up is the #1 AI-generated code smell.
- **"Why should I care?":** When an AI writes task-related code in the wrong layer (business logic in a controller, database calls in a component), you can now recognize it and ask for a fix.

## Code Snippets (pre-extracted)

**File: avise-api/src/data/tasks/index.ts (lines 1146-1163)** — setTaskStatus (simpler sibling, good for translation)
```ts
function setTaskStatus(
  companyId: string,
  taskId: string,
  status: TaskStatus,
): PrismaPromise<PrismaTask> {
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
    },
  });
}
```

**File: avise-api/src/services/tasks/taskReopener.ts (lines 106-117)** — reopenDueToLedgerUpdates orchestration
```ts
const reopenDueToLedgerUpdates = async (
  companyId: string,
  ledgerUpdates?: LedgerUpdate[],
): Promise<void> => {
  if (ledgerUpdates?.length) {
    // Fetch all tasks associated with incoming accountIds and their associated Period
    const tasksWithPeriod = await fetchTasksForLedgerUpdates(ledgerUpdates, companyId);

    // reopen tasks that have been affected by the ledger updates
    await reopenQualifyingTasks(tasksWithPeriod, companyId);
  }
};
```

## Interactive Elements

- [x] **Anchor screen (Pattern A):** the delivery pipeline metaphor with 5 pattern cards (one per layer): Browser (Lucide `monitor`), API Controller (Lucide `server`), Service Layer (Lucide `cog`), Data Layer (Lucide `layers`), PostgreSQL (Lucide `database`). Each card has: layer name, what job it does, what it DOES NOT do.

- [x] **Mechanism screen (Pattern B) — hero visual:** data flow animation tracing "Mark as Prepared" click end-to-end. Actors: Browser, Controller, Service, Data Layer, PostgreSQL. Steps: (1) Browser sends PATCH /tasks/:id, (2) Controller validates auth & request shape, (3) Controller calls service.update(), (4) Service enforces business rules (can this status transition happen?), (5) Service calls data.setTaskStatusAndEvent(), (6) Data layer runs Prisma .update() with nested event create, (7) PostgreSQL writes both rows atomically, (8) response travels back up through all layers, (9) Browser shows new status.

- [x] **Mechanism screen (Pattern B):** code↔English translation of `setTaskStatus` (snippet 1 — the data layer function). Translate: companyId + taskId = a compound key that uniquely identifies a task (prevents cross-company data leaks), prisma.task.update = the ORM generates the SQL, statusUpdatedAt = clock_timestamp() = the DB's clock, not the app server's (more accurate). Callout: "The data layer speaks only Prisma. It never contains business logic — no 'if the task is reviewed, send an email.' That logic lives one floor up in the service layer."

- [x] **Mechanism screen (Pattern B):** code↔English translation of `reopenDueToLedgerUpdates` (snippet 2 — the service layer). Highlight the orchestration: fetch which tasks are affected, then reopen only the qualifying ones. The service coordinates multiple data-layer calls; no raw Prisma queries appear here.

- [x] **Group chat — synthesis visual:** all 5 actors talking as the "Mark as Prepared" click flows through. Browser: "Sending PATCH /tasks/abc-123 {status: prepared}." Controller: "Auth checks out. Calling service.update()." Service: "Task is in_progress. Transition to prepared is valid. Calling data.setTaskStatusAndEvent()." Data Layer: "Running Prisma UPDATE + CREATE event in one transaction..." PostgreSQL: "Both rows written. Transaction committed." Data Layer → Service → Controller → Browser: "200 OK. Task is now prepared."

- [x] **Application screen (Pattern C):** quiz, 3 questions:
  1. Architecture: "An AI-generated feature adds an email notification inside data/tasks/index.ts. What is wrong with this?" (The data layer should only handle database queries. Business side effects like emails belong in the service layer.)
  2. Debugging: "A task status changes but no TaskEvent is recorded. Which function was probably called?" (setTaskStatus instead of setTaskStatusAndEvent — the simpler function does not create an event)
  3. Scenario: "You need to add a new validation: tasks cannot be marked 'prepared' if they have no resolution text. Where should this check live?" (Service layer — it is a business rule, not a database operation)

## Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Code ↔ English Translation Blocks", "Group Chat Animation", "Message Flow / Data Flow Animation", "Multiple-Choice Quizzes", "Pattern/Feature Cards", "Callout Boxes", "Icons (Lucide)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

## Connections
- **Previous module:** Module 5 (Auto-Review) — showed smart automation within the task system. This module zooms out to show how ALL task operations are structured across the full stack.
- **Next module:** none — this is the final module. End with a synthesis callout: "You now have the mental model to steer an AI building any new task feature with precision."
- **Tone/style notes:** Accent amber. Module uses `background: var(--color-bg-warm)` (even). Chat actors: "B" for Browser (amber/actor-4), "C" for Controller (teal/actor-2), "S" for Service (plum/actor-3), "D" for Data Layer (forest/actor-5), "P" for PostgreSQL (vermillion/actor-1). Tooltips on: ORM, controller, service layer, data layer, atomic transaction, HTTP PATCH, compound key.
