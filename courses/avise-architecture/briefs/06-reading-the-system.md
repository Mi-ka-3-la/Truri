# Module 6: Reading the System

### Teaching Arc
- **Metaphor:** A ship's navigator using charts, sonar, and radio together to find the ship's position. No single instrument gives the full picture. The navigator switches between tools depending on the question: "Are we on course?" (chart), "What's below us?" (sonar), "What did the harbor say?" (radio). Debugging Avise works the same way — you switch between DataDog, operation tracking, logs, and code depending on the question you're answering.
- **Opening hook:** "The architecture course has given you the map. Now it's time to use it. This final module is about the one skill that separates developers who panic at production incidents from developers who stay calm: knowing exactly where to look."
- **Key insight:** Every bug has a layer. Frontend rendering bugs live in avise-web. API logic bugs live in avise-api controllers/services. Data bugs live in the Prisma schema or migrations. Permission bugs live in SpiceDB. External service bugs show up in DataDog. The operation tracking system records what long-running jobs actually did. Start from the symptom, use the right instrument.
- **"Why should I care?":** With this mental model, you'll stop the "grep everything and pray" debugging style and start the "identify the layer, look in the right place" debugging style. Your debugging time drops from hours to minutes.

### Code Snippets (pre-extracted)

**File: avise-shared-utils/src/operationTracking/index.ts (conceptual)**
```ts
// Every long-running job creates an Operation with events appended over its lifetime.
// To understand what happened, read the events in order.
async function createEventForOperationId(
  operationId: string,
  event: IncompleteOperationEvent,
): Promise<OperationEvent> {
  const operation = await getOperation(operationId);
  // Each event records: what happened, when, by whom, and any data payload
  return createEventForOperation(operation, event);
}
```

**File: avise-shared-utils/src/logger/index.ts (conceptual — pattern)**
```ts
// Winston logger — structured JSON logs sent to DataDog
logger.info("[AI:fileUpload] File saved to library", {
  fileName: file.fileName,
  fileId: libraryFile.id,
  contentType: file.contentType,
  size: file.sizeInBytes,
});
// The structured object becomes searchable in DataDog:
// @file.fileId:abc-123 shows all logs about that specific file
```

**File: avise-api/src/ai/index.ts (loop safety)**
```ts
// The AI loop has a built-in infinite-loop guard:
const MAX_TOOL_CALLS = config.ai.maxToolCalls;
// Stub tools add ~100 to the safe maximum
const MAX_ITERATIONS = MAX_TOOL_CALLS + 100;
// If this limit is hit, it's a bug — look for a tool that's calling itself
```

### Interactive Elements
- [x] **Anchor screen (Pattern A):** "The Debugging Decision Tree" — a Mermaid flowchart. Root: "Something is broken." → Branch 1: "Is it visible in the UI?" → avise-web (React DevTools, browser console). Branch 2: "Does the API return an error?" → avise-api (DataDog logs, API logs). Branch 3: "Is the data wrong in the DB?" → PostgreSQL (check migrations, Prisma schema). Branch 4: "Is a permission denied?" → SpiceDB + authorizationClient. Branch 5: "Did a background job fail?" → BullMQ/Argo + operation tracking. Branch 6: "Is an external service down?" → DataDog + service status page.
- [x] **Mechanism screen (Pattern B) — screen 2: DataDog as the first instrument:** Code-Walk of logger.info pattern (snippet 2). Key teaching: every log line has a structured payload, not just a string. `@file.fileId:abc-123` in DataDog searches across all logs for that specific file. Show the query pattern: `service:avise-api @companyId:xyz status:error`. Callout: "Structured logging is the difference between searching a filing cabinet with labeled folders vs. searching a pile of paper. Every `logger.info(message, { structured: data })` call is adding a labeled folder."
- [x] **Mechanism screen (Pattern B) — screen 3: Operation Tracking for long-running jobs:** Code-Walk of operationTracking (snippet 1). Key teaching: when a sync job runs for 45 minutes, how do you know what it did? Each step appends an event. To debug a stuck sync: query the operation events in order — find the last successful event, and that's where it stopped. Callout: "Operation tracking is a flight recorder for background jobs. The plane (job) already landed (or crashed) — but the recorder tells you everything that happened during the flight, second by second."
- [x] **Mechanism screen (Pattern B) — screen 4: Group chat — "Real incident response":** Actors: Developer (D) / DataDog (DD) / avise-api (A) / PostgreSQL (P). D→DD: "Company X's sync hasn't run in 6 hours. Show me errors." DD→D: "Found: 'Operation xyz failed: connection timeout at step file_processing'." D→A: "Check operation xyz events." A→D: "Last event: file_indexed at 14:23, then silence." D→P: "SELECT * FROM operation_events WHERE operation_id='xyz' ORDER BY created_at." P→D: "47 events, last one 6 hours ago." D→D: "Root cause: DB connection pool exhausted. Fix: increase pool size." Use id="chat-incident".
- [x] **Application screen (Pattern C) — screen 5 (final module — "Finish Course" CTA instead of Continue):** Quiz, 4 scenario questions:
  1. "A user reports 'I tried to approve a journal entry and got an error.' The UI showed a red toast. Where do you look first?" (DataDog, filter by companyId + status:error — API layer issue)
  2. "A QBO sync completed but 200 transactions are missing from Avise. DataDog shows no errors. What's the most likely cause?" (Mapping/transform bug in avise-api — data made it through the queue but was dropped during transformation)
  3. "A new engineer asks: 'Where is the logic for calculating whether a journal entry can be posted?' You know it's a domain rule. Which workspace?" (avise-domains)
  4. "Feature X works fine in dev but not in production. No errors in DataDog. What's the most likely cause?" (Feature flag — Split.io flag may be OFF in prod but ON in dev)

### Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Group Chat Animation", "Multiple-Choice Quizzes", "Code-Walk", "Callout Boxes", "Glossary Tooltips", "Icons (Lucide)", "Layout Utilities", "Inter-Module Navigation (Continue CTA)" (use "Finish Course" variant for last module)
- `references/data-visualization.md` → "Pattern 2: Architecture Preview Map" (for the Debugging Decision Tree flowchart)
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file
- `references/accessibility.md` → "The Quick Checklist" (run before declaring done)

### Connections
- **Previous module:** Module 5 (The Outside World) — covered external services and their failure modes
- **Next module:** None — this is the final module. End with "Finish Course" CTA and a brief "What's next" callout: "Now that you have the full architecture map, the next step is to run `codebase-to-patterns` on the monorepo to extract the reusable patterns from each service."
- **Tone/style notes:** Forest green accent. End on a practical, empowering note — the learner now has the complete mental model. No new concepts in the final quiz — test application of everything from all 6 modules.
