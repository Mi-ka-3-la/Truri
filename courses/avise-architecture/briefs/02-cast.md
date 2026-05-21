# Module 2: The Cast of Characters

### Teaching Arc
- **Metaphor:** A film production crew. The movie (Avise) looks seamless on screen, but behind it is a director (avise-api), a set designer (avise-web), a props department (avise-shared-utils), a script archive (avise-domains), and a dozen specialized vendors (Auth0, DataDog, etc.). Each person has one job. Confusion happens when one person tries to do another's job.
- **Opening hook:** "The avise monorepo has 24+ workspaces. That sounds overwhelming — until you realize only 4 of them do the heavy lifting. The rest are specialists called in for specific scenes."
- **Key insight:** Every service has a single responsibility. avise-web renders UI. avise-api runs business logic and talks to databases. avise-domains holds pure domain logic that doesn't care about HTTP or databases. avise-shared-utils is the toolbox everyone shares.
- **"Why should I care?":** When an AI agent asks "where should I put this code?", you'll know: UI logic goes in avise-web, business rules go in avise-api services or avise-domains, shared utilities go in avise-shared-utils. Wrong placement creates spaghetti.

### Code Snippets (pre-extracted)

**File: avise-monorepo/README.md (workspaces section)** — workspace list
Key workspaces:
- avise-web — Web frontend application (React)
- avise-api — Main API backend service (Node.js + Express)
- avise-domains — Domain-centric code extracted from avise-api
- avise-shared-utils — Shared utilities across all applications
- allspice (cli + client + dsl-compiler) — Custom SpiceDB type-safe bindings generator
- operation-tracking — Long-running operation tracking service
- qbo-sync — QuickBooks Online synchronization service
- knock — Notification workflow templates
- mcp-avise-docs — MCP server for Avise documentation
- mcp-testing-and-support — MCP server for browser automation and support

**File: avise-domains/README.md (architecture section)**
```
In this paradigm, code is organized around business domains rather than technical layers:
- Core types and functions are based on the business domain (not controller/service/data)
- Domain types intentionally do not follow conventions specific to other layers
- Domain-centric code should be treated like a library with a well-defined API
- Code implementing a REST interface provides one way domain types can be accessed
```

**File: avise-api/src/app.ts (startup order)**
```ts
// Startup order shows initialization dependencies:
import "avise-shared-utils/datadog";        // 1. Observability FIRST
import { FeatureFlagsClient } from "avise-shared-utils/featureFlags"; // 2. Feature flags
import prisma from "./prisma";               // 3. Database ORM
import { buildApp } from "./buildApp";       // 4. Express app
import bullmq from "./libraries/bullmq";    // 5. Job queue
import { initializeAuthClient } from "./authorization/authorizationClient"; // 6. SpiceDB
import { WebSocketServer } from "avise-shared-utils/websocket/server"; // 7. WebSocket
import { initializePublisher } from "avise-shared-utils/rabbitmq";    // 8. Message bus
```

### Interactive Elements
- [x] **Anchor screen (Pattern A):** Actor icon-row layout — 4 main services as icon cards. Each card has: icon (monitor, server, layers, wrench), name, one-line responsibility. Then a second row for specialist services (operation-tracking, qbo-sync, knock, allspice, mcp-*).
- [x] **Mechanism screen (Pattern B) — Tech Stack Architecture element (REQUIRED for Module 2):**
  Full stack table: Browser layer (React 18, Vite, React Router, React Query, Axios) → API layer (Node.js, Express, TypeScript, JWT/Auth0) → Domain layer (avise-domains, Prisma ORM, Drizzle) → Data layer (PostgreSQL, SpiceDB, Redis) → Infrastructure (Turborepo, pnpm workspaces, Kubernetes/Argo CD, AWS ECR, GitHub Actions) → Observability (DataDog).
  Include rationale row: "Why TypeScript everywhere? One type error caught at compile time saves 2 hours of debugging at runtime."
- [x] **Mechanism screen (Pattern B) — screen 3:** Code-Walk of the app.ts startup sequence (snippet 3). Key teaching: the ORDER of initialization matters — DataDog must come first so every other service's logs are captured. Callout: "The startup order IS the dependency graph. If Prisma tries to connect before DataDog is set up, errors go untracked. The import order in app.ts encodes architectural decisions."
- [x] **Mechanism screen (Pattern B) — screen 4:** Visual explanation of avise-domains' "domain-centric" approach (snippet 2). Contrast with the old layered approach (controller → service → data). Callout: "A domain type doesn't know about HTTP or SQL. It just describes a business concept — a Schedule, a JournalEntry. This means you can use it in the REST API, in a background job, or in a CLI tool without changing it."
- [x] **Application screen (Pattern C) — screen 5:** Quiz, 3 questions:
  1. "You need to add logic to calculate whether a journal entry is valid. Which workspace does this belong in?" (avise-domains — pure business logic)
  2. "A new external API integration needs retry logic and config validation. This utility will be used by both avise-api and qbo-sync. Where does it go?" (avise-shared-utils)
  3. "You're seeing 'Cannot read property of undefined' in production but can't reproduce it locally. Which initialization step in app.ts would you check first, and why?" (Tests understanding of startup order)

### Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Tech Stack Architecture", "Multiple-Choice Quizzes", "Code-Walk", "Callout Boxes", "Glossary Tooltips", "Icons (Lucide)", "Layout Utilities", "Inter-Module Navigation (Continue CTA)"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

### Connections
- **Previous module:** Module 1 (One Click, Seven Layers) — showed the services in motion
- **Next module:** Module 3 (How They Talk) — now that they know WHO the actors are, teach HOW they communicate
- **Tone/style notes:** Forest green accent. Consistent actor naming. The "domain-centric" concept introduced here is revisited in Module 4 when we discuss avise-domains' database schema.
