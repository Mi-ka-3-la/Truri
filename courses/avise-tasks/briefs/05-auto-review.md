# Module 5: Auto-Review and the Smart Reopener

## Teaching Arc
- **Metaphor:** A smoke detector — it runs silently in the background and only triggers when something genuinely changes. The auto-reviewer is the system's "all clear" signal. The taskReopener is the alarm that goes off when new transactions arrive after the work was marked done.
- **Opening hook:** "What if the system could review simple, unchanged accounts automatically and save your team hours of manual approval? And what if it could detect when new transactions arrive AFTER a preparer submitted — and automatically reopen the task so nothing gets missed?"
- **Key insight:** The auto-review and task reopener systems both work by comparing a STORED snapshot (balanceWhenLastPrepared) to a CURRENT value. The snapshot is the key — it is what makes both features possible.
- **"Why should I care?":** These two systems are what make Avise smart rather than just a task tracker. Knowing they exist (and how they work) helps you configure thresholds, understand unexpected reopens, and add new auto-review logic when needed.

## Code Snippets (pre-extracted)

**File: avise-api/src/services/taskReview/taskAutoReviewer.ts (lines 41-78)** — attemptAutoReviewForUnpreparedTasks
```ts
async function attemptAutoReviewForUnpreparedTasks(
  args: TaskAutoReviewArgs,
  runSync: boolean = false,
): Promise<void> {
  const jobId = uuid.v4();
  if (config.taskAutoReviewer.runAsync && !runSync) {
    return addAutoReviewJobToQueue(args);
  } else {
    const company = await companies.get(args.companyId);
    const reconciliationThresholdSettings =
      companiesService.extractAutoReconciliationSettings(company);
    const fluxThresholdSettings = companiesService.extractAutoFluxSettings(company);
    const allTasks = await tasksData.listWithPeriod(args.companyId, args.taskIds);
    const tasksByType = lodash.groupBy(allTasks, (task) => task.taskType);
    const reconciliationTasks = tasksByType[TaskType.reconciliation];
    const fluxTasks = tasksByType[TaskType.flux];

    if (
      !isAutoReconciliationEnabled(reconciliationThresholdSettings) &&
      !isAutoReviewFluxEnabled(fluxThresholdSettings)
    ) {
      return;
    }
    // ... evaluate each task against thresholds
  }
}
```

**File: avise-api/src/services/tasks/taskReopener.ts (lines 84-99)** — balance comparison
```ts
const { balanceWhenLastPrepared } = task;

if (currentBalance !== undefined && currentBalance !== balanceWhenLastPrepared) {
  // Create Event
  const balanceDetails = await tasksData.getBalanceDetails(task, TaskStatus.reopened);

  // Set It to be Opened again
  await tasksData.setTaskStatusAndEvent(companyId, task.id, TaskStatus.reopened, {
    reason: SystemTaskChangeReason.BALANCE_CHANGED,
    status: TaskStatus.reopened,
    balances: {
      periodEndingBalance: balanceDetails?.periodEndingBalance,
      balanceWhenLastPrepared: balanceDetails?.balanceWhenLastPrepared,
    },
  });
}
```

## Interactive Elements

- [x] **Anchor screen (Pattern A):** smoke detector metaphor. Two pattern cards side by side: "Auto-Reviewer" (Lucide `check-circle-2`, color actor-5/green) — "Silently reviews tasks that don't need human eyes"; "Task Reopener" (Lucide `bell-ring`, color actor-1/vermillion) — "Raises the alarm when the numbers change after submission." Both compare a stored snapshot vs a current value.

- [x] **Mechanism screen (Pattern B):** code↔English translation of the balance comparison in taskReopener.ts (snippet 2). Key: `balanceWhenLastPrepared` was stored at prepare time; `currentBalance` is computed now. If they differ, `setTaskStatusAndEvent` is called to reopen — with an audit event explaining the balance change. Callout: "Storing the snapshot at prepare time is the architectural decision that makes reopening possible. Without it, you could never know if anything changed — you would have to recheck everything from scratch every time."

- [x] **Mechanism screen (Pattern B):** code↔English translation of `attemptAutoReviewForUnpreparedTasks` (snippet 1). Highlight: thresholds are per-company settings (balanceThreshold, fluxPercentChangeThreshold), auto-review runs asynchronously via a job queue for performance, groupBy separates reconciliation vs flux tasks since each has different threshold logic.

- [x] **Group chat animation — hero visual:** actors: Journal Entry System (JE), Task Reopener (TR), Database (DB). JE: "New journal entry posted to account X-123 for period March." TR: "That account has a PREPARED reconciliation task in March. Fetching current balance..." DB: "Current balance: $52,400." TR: "balanceWhenLastPrepared was $48,200. Difference exceeds zero. Reopening task with reason BALANCE_CHANGED." DB: "Task status updated to reopened. TaskEvent created." TR: "Task reopened. Preparer will be notified."

- [x] **Application screen (Pattern C):** quiz, 2 questions:
  1. Debugging: "A preparer complains that their task keeps getting reopened right after they submit it. Where would you look to diagnose this?" (taskEvents for the reason; check if new journal entries are being posted to that account around the same time)
  2. Architecture: "The auto-reviewer runs asynchronously in a job queue. Why not run it synchronously in the same API request?" (performance — checking thresholds for many tasks is expensive; doing it in the same HTTP request would make the prepare action slow for the user)

## Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Code ↔ English Translation Blocks", "Group Chat Animation", "Multiple-Choice Quizzes", "Pattern/Feature Cards", "Callout Boxes", "Icons (Lucide)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

## Connections
- **Previous module:** Module 4 (Recurring Tasks) — showed how tasks are created automatically. This module shows how the system automatically manages them after creation.
- **Next module:** Module 6 (Full Stack) — traces the complete journey of a user action end-to-end through all layers of the stack.
- **Tone/style notes:** Accent amber. Module uses `background: var(--color-bg)` (odd). Chat: "JE" for Journal Entry System (vermillion/actor-1), "TR" for Task Reopener (teal/actor-2), "DB" for Database (plum/actor-3). Tooltips on: asynchronous, job queue, threshold, snapshot, audit event, idempotent.
