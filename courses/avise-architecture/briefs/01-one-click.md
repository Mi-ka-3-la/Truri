# Module 1: One Click, Seven Layers

### Teaching Arc
- **Metaphor:** A letter traveling through a postal system. The user is the sender, the browser is the mailbox, each service is a sorting station that handles the letter and passes it to the next, and the database is the archive room where it finally rests.
- **Opening hook:** "Imagine you fill in a journal entry in Avise and click Save. That single click travels through 7 distinct layers before anything is actually written to the database — and the response has to travel all 7 layers back. Here's the complete journey."
- **Key insight:** Every user action in Avise is a round trip through: Browser → React (avise-web) → Axios → Express Router (avise-api) → Controller → Service → Prisma ORM → PostgreSQL. Understanding this pipeline means you always know which layer to inspect when something goes wrong.
- **"Why should I care?":** When a bug surfaces — "the save button doesn't respond," "data isn't showing up," "the page shows an error" — you need to know which layer is failing. This pipeline is your diagnostic map.

### Code Snippets (pre-extracted)

**File: avise-web/src/api/apiClient.ts (lines 1-35)** — Axios setup and API wrapper
```ts
import axios, { AxiosRequestConfig } from "axios";
import { segment } from "src/analytics/analytics";

const aviseApiConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.REACT_APP_API_URL || "",
};
const axiosInstance = axios.create(aviseApiConfig);

export const api = {
  ...axiosInstance,
  get: <T>(url: string, config?: AxiosRequestConfig<T>) => {
    return axiosInstance.get<T>(url, config);
  },
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig<T>) => {
    return axiosInstance.post<T>(url, data, config);
  },
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig<T>) => {
    return axiosInstance.put<T>(url, data, config);
  },
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig<T>) => {
    return axiosInstance.patch<T>(url, data, config);
  },
  delete: <T>(url: string, config?: AxiosRequestConfig<T>) => {
    return axiosInstance.delete<T>(url, config);
  },
};
```

**File: avise-api/src/apiRouter.ts (lines 1-55)** — Express router structure
```ts
function apiRouter(): Router {
  const r = Router();
  const guard = createGuard();

  r.use(jwtAuthentication());
  r.use("/sync", guard.check("sync:all"), syncRouter());
  r.use(userIdentityMiddleware());
  r.use(invitedUserRouter());
  r.use("/support-tools", customerSupportRouter());
  r.use("/organizations/:organizationId", organizationRouter());
  r.post("/companies", organizationAdminMiddleware(), companyController.create);
  r.use("/companies/:companyId", companyContextMiddleware(), companyRouter());
  r.get("/account-classifications", accountController.classifications);
  r.use("/consolidations/:consolidationId", consolidationRouter());
  r.post("/consolidations", organizationAdminMiddleware(), consolidationController.create);
  r.use("/notifications", notificationsRouter);

  return r;
}
```

**File: avise-api/src/app.ts (partial)** — App startup sequence showing initialization order
```ts
// DataDog tracing always needs to be the first import
import "avise-shared-utils/datadog";
import { FeatureFlagsClient } from "avise-shared-utils/featureFlags";
import prisma from "./prisma";
import { buildApp } from "./buildApp";
import bullmq from "./libraries/bullmq";
import { initializeAuthClient } from "./authorization/authorizationClient";
import { WebSocketServer } from "avise-shared-utils/websocket/server";
import { initializePublisher } from "avise-shared-utils/rabbitmq";
```

### Interactive Elements
- [x] **Anchor screen (Pattern A):** Hero data flow animation — 7 steps, left to right: Browser → React UI → Axios → Express Router → Controller+Service → Prisma → PostgreSQL. Each step lights up sequentially with a one-sentence description. Must use `.flow-animation` with `data-steps` JSON.
- [x] **Mechanism screen (Pattern B) — screen 2:** Code-Walk of the Axios `api` wrapper (snippet 1). Highlight: `baseURL: import.meta.env.REACT_APP_API_URL` — the frontend doesn't hardcode the server address, it reads it from environment. Tooltip: `Axios`, `AxiosRequestConfig`, `baseURL`, `import.meta.env`.
- [x] **Mechanism screen (Pattern B) — screen 3:** Code-Walk of the Express router (snippet 2). Show how middleware stacks: JWT auth runs on every request, then `userIdentityMiddleware`, then per-route handlers. Callout: "Middleware is like a airport security — everyone passes through it before reaching their gate." Tooltip: `middleware`, `JWT`, `Router`.
- [x] **Mechanism screen (Pattern B) — screen 4:** Group chat animation — "A Save Request's Journey." Actors: Browser (B) / avise-web (W) / avise-api (A) / PostgreSQL (P). Messages: B→W: "User clicked Save", W→A: "POST /v1/companies/:id/journal-entries (with JWT)", A→A: "Check JWT → find user → check permission", A→P: "INSERT INTO journal_entries ...", P→A: "Row saved, ID returned", A→W: "201 Created {id: ...}", W→B: "Update UI, show success". Use id="chat-save-journey" on `.chat-window`.
- [x] **Application screen (Pattern C) — screen 5:** Quiz, 3 scenario questions:
  1. "A user reports the Save button spins forever and nothing saves. You check the browser console — no network error. Where is the problem NOT?" (Tests: problem is backend-side, not frontend network layer)
  2. "The API returns a 403 Forbidden when a user tries to create a journal entry. Which middleware in the Express router is most likely responsible?" (Tests: understanding of auth middleware chain)
  3. "You need to add a new API endpoint for bulk importing entries. Which layer do you add it to FIRST?" (Tests: router → controller → service → data ordering)

### Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Message Flow / Data Flow Animation", "Group Chat Animation", "Multiple-Choice Quizzes", "Code-Walk", "Callout Boxes", "Glossary Tooltips", "Icons (Lucide)", "Layout Utilities", "Inter-Module Navigation (Continue CTA)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

### Connections
- **Previous module:** Module 0 (Landing) — introduced the course and the map metaphor
- **Next module:** Module 2 (The Cast of Characters) — now that they've seen the flow, they'll meet each actor in detail
- **Tone/style notes:** Actor names: "Browser" / "avise-web" / "avise-api" / "PostgreSQL". Never "the frontend" or "the DB." Accent: forest green.
