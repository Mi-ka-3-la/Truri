# Module 3: How They Talk

### Teaching Arc
- **Metaphor:** A busy office building with 5 communication methods: phone calls for quick questions (REST), a walkie-talkie channel that stays open (WebSocket), a physical inbox/outbox for tasks that can wait (BullMQ queue), a project management board for big multi-week projects (Argo Workflows), and a company-wide loudspeaker for announcements (Knock notifications). Each method exists because it solves a different problem.
- **Opening hook:** "Services in Avise don't talk the same way to each other. Sometimes it's a phone call that expects an immediate answer. Sometimes it's a message left in a mailbox. Sometimes it's a work order handed to a separate team. The communication method chosen tells you how urgent, how long-running, and how reliable the interaction needs to be."
- **Key insight:** The 5 patterns are REST (request/response), WebSocket (persistent bidirectional), BullMQ (async job queue), Argo Workflows (distributed long-running), and Knock (notification delivery). Each pattern is chosen for a specific set of constraints — latency, duration, reliability, and whether the caller needs to wait for a response.
- **"Why should I care?":** If you're adding a new feature, the communication pattern you choose determines how the system will behave under load, failures, and timeouts. Wrong pattern = silent failures, timeouts, or wasted compute.

### Code Snippets (pre-extracted)

**File: avise-web/src/api/apiClient.ts** — REST via Axios
```ts
export const api = {
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig<T>) => {
    return axiosInstance.post<T>(url, data, config);
  },
};
// Usage in avise-web:
// const { mutate } = useMutation({ mutationFn: () => api.post('/v1/companies/:id/journal-entries', payload) });
```

**File: avise-api/src/app.ts (WebSocket section)**
```ts
import { WebSocketServer, WebSocketCallbacks, AuthenticatedWebSocket } from "avise-shared-utils/websocket/server";

async function handleNewWebSocketConnection(ws: AuthenticatedWebSocket): Promise<void> {
  const idpId = ws.jwtPayload.sub;
  const identity = await identityService.getUserIdentityByIdpId(idpId);
  if (identity) {
    ws.userId = identity.id;
    logger.debug("[WebSocket] User identity resolved", { idpId, userId: identity.id });
  }
}
```

**File: avise-api/src/libraries/bullmq.ts context + avise-api/src/jobs/recurringTasks.ts (conceptual)**
BullMQ pattern (simplified from codebase):
```ts
// Producer: enqueue a job
await queue.add('processRecurringTask', { taskId, companyId });

// Worker: process jobs from the queue
worker.on('completed', job => logger.info(`Job ${job.id} completed`));
worker.on('failed', (job, err) => logger.error(`Job ${job.id} failed`, err));
```

**File: avise-shared-utils/src/rabbitmq/index.ts**
```ts
export * from "./publisher";
export * from "./consumer";
export type { RabbitMqConfig } from "./config";
```

**File: avise-api/src/ai/index.ts (WebSocket events, simplified)**
```ts
// Server pushes typed events over WebSocket as AI thinks:
// ws.send({ type: 'tool_call', toolName: 'findJournalEntries' });
// ws.send({ type: 'artifact', artifact: tableData });
// ws.send({ type: 'message', content: assistantText });
// ws.send({ type: 'done' });
// Client handles each event independently — no waiting for full response.

// MAX_ITERATIONS accounts for stub-upgrade loops in the AI loop
const MAX_TOOL_CALLS = config.ai.maxToolCalls;
const MAX_ITERATIONS = MAX_TOOL_CALLS + 100;
```

### Interactive Elements
- [x] **Anchor screen (Pattern A):** Section Preview Map (Mermaid flowchart) — 5 communication patterns arranged as branches from a central "Services" node. Each branch label: "Quick Q&A → REST", "Real-time → WebSocket", "Background work → BullMQ Queue", "Long-running ops → Argo Workflows", "Announcements → Knock". This gives the learner the skeleton before each detail screen.
- [x] **Mechanism screen (Pattern B) — screen 2: REST:** Code-Walk of Axios api.post + React Query useMutation pattern. Key teaching: React Query wraps the HTTP call and manages loading/error/success states automatically. Callout: "REST is a phone call — you dial, wait for the other person to pick up, get your answer, hang up. The caller is blocked until the response arrives. That's fine for things that finish in under 2 seconds."
- [x] **Mechanism screen (Pattern B) — screen 3: WebSocket for AI chat:** Code-Walk of the WebSocket connection setup and typed events (snippet 2 + 5). Key teaching: WebSocket is a walkie-talkie — the channel stays open. The server can push events ANYTIME without the client asking. This is why AI chat can show "Searching journal entries..." while still thinking. Tooltip: `WebSocket`, `bidirectional`, `authenticated`. Callout: "Before WebSocket, AI chat had a timeout problem — if the LLM took over 30 seconds, the HTTP request would time out. WebSocket eliminated timeouts by keeping the channel alive for as long as needed."
- [x] **Mechanism screen (Pattern B) — screen 4: BullMQ + Argo:** Code-Walk of BullMQ producer/worker pattern (snippet 3). Then describe Argo Workflows contrast: BullMQ = single server, minutes-long jobs. Argo = Kubernetes, hours-long jobs with full observability. The TODOs in the codebase (nsSyncCompany, qboSyncCompany) show the migration from BullMQ to Argo in progress.
- [x] **Mechanism screen (Pattern B) — screen 5: Group chat — "Which channel do I use?"** Chat actors: Engineer (E) / Avise Architecture (A). E: "I need to send a notification to a user when their task is completed." A: "Use Knock — it's the announcement system. Not REST (user might be offline), not WebSocket (not persistent enough)." E: "I need to sync 10,000 QBO transactions." A: "Use Argo Workflow — it'll take minutes, needs retry logic, and must survive a server restart." E: "User clicks a button to generate a report." A: "REST — fast, synchronous, user is waiting." Use id="chat-which-channel".
- [x] **Application screen (Pattern C) — screen 6:** Quiz, 4 scenario questions:
  1. "A user wants to download a large CSV export of all their journal entries. This takes 45 seconds to generate. Which communication pattern?" (BullMQ queue — async, user doesn't wait)
  2. "You're building a feature where a supervisor can see a team member's cursor position in real time. Which pattern?" (WebSocket — real-time bidirectional)
  3. "The system needs to email 5,000 users when a new feature launches. Which pattern?" (Knock — notification delivery system)
  4. "A user clicks 'Save' on a form. The response must confirm the save succeeded before the UI updates. Which pattern?" (REST — synchronous request/response)

### Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Message Flow / Data Flow Animation", "Group Chat Animation", "Multiple-Choice Quizzes", "Code-Walk", "Callout Boxes", "Glossary Tooltips", "Icons (Lucide)", "Layout Utilities", "Inter-Module Navigation (Continue CTA)"
- `references/data-visualization.md` → "Pattern 2: Architecture Preview Map" (for the Section Preview Map flowchart)
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

### Connections
- **Previous module:** Module 2 (The Cast of Characters) — introduced each service
- **Next module:** Module 4 (Where Things Live) — shifts from HOW services talk to WHERE data is stored
- **Tone/style notes:** Forest green accent. The 5 patterns are introduced in order of familiarity: REST (most familiar) to Argo (most specialized). Keep the office-building metaphor consistent within this module.
