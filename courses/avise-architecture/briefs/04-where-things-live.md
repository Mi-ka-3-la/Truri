# Module 4: Where Things Live

### Teaching Arc
- **Metaphor:** A law firm's filing system. Client contracts go in the fireproof safe (PostgreSQL — permanent, important). Access permission cards go in the security office's separate locked cabinet (SpiceDB — who can access what). Sticky notes for work in progress go on the whiteboard (Redis — fast, temporary). Scanned documents go in the off-site storage warehouse (AWS S3 — cheap, large). The firm's brain trust index (who the experts are on each topic) is a separate index card system (TurboPuffer — vector search).
- **Opening hook:** "Avise stores data in 5 different places. That's not laziness — each storage system exists because it's the right tool for a specific job. Storing everything in PostgreSQL would be like keeping sticky notes in a fireproof safe."
- **Key insight:** PostgreSQL (via Prisma) is the main permanent store. SpiceDB is a dedicated permissions graph — separate from PostgreSQL because permission checks must be lightning-fast and not compete with business data queries. Redis handles temporary fast-access data (job queues, caching). S3 stores files. TurboPuffer stores AI vector embeddings for semantic search.
- **"Why should I care?":** When you're debugging "the data is wrong" or "permissions aren't working," you need to know WHICH database to look in. When you're adding a new feature that stores data, you need to know which storage system is appropriate.

### Code Snippets (pre-extracted)

**File: avise-domains/prisma/schema.prisma (representative excerpt — actual file):**
Show 3 representative models from schema — Company, JournalEntry, and Task — to illustrate relationships.
Use this conceptual excerpt based on what exists (actual schema has these entities):
```prisma
model Company {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  organization   Organization @relation(fields: [organizationId], references: [id])
  journalEntries JournalEntry[]
  tasks          Task[]
  createdAt      DateTime @default(now())
}

model JournalEntry {
  id        String   @id @default(cuid())
  companyId String
  status    JournalEntryStatus
  company   Company  @relation(fields: [companyId], references: [id])
  lines     JournalLine[]
  createdAt DateTime @default(now())
}

model Task {
  id          String   @id @default(cuid())
  companyId   String
  assigneeId  String?
  status      TaskStatus
  company     Company  @relation(fields: [companyId], references: [id])
}
```

**File: avise-api/src/authorization/authorizationClient.ts (lines 1-30)**
```ts
import { v1 as authzed } from "@authzed/authzed-node";
import { Allspice, TypedRelationship } from "allspice-client";
import { ResourcePermissions, ResourceRelations } from "../generated/allspice/types";

// SpiceDB is a completely separate database from PostgreSQL.
// It only stores "who can do what to which resource."
// All permission checks go here — never to PostgreSQL.
export type WriteRelationshipsInput<
  Resource extends keyof ResourceRelations & string,
  Subject extends keyof ResourceRelations[Resource] & string,
> = WriteRelationshipsParams<ResourceRelations, ResourcePermissions, Resource, Subject>[];
```

**File: avise-shared-utils/src/promiseUtil/index.ts (asyncMapInChunks signature)**
```ts
async function asyncMapInChunks<X, Y>(
  array: X[],
  callback: (x: X, idx: number, subArray: X[]) => Promise<Y>,
  chunkSize: number = array.length,
  failFaster: boolean = false,
): Promise<Array<Y>> {
  // Chunks are processed sequentially.
  // Within each chunk, all items run in parallel via Promise.allSettled.
  // This prevents overloading the database connection pool.
}
```

### Interactive Elements
- [x] **Anchor screen (Pattern A):** 5-storage-system bento grid. Each card: icon, name, type, what it stores, speed. PostgreSQL (database icon, "Permanent business data", medium speed), SpiceDB (shield icon, "Permission relationships", fast), Redis (zap icon, "Job queues + cache", very fast), S3 (cloud icon, "Files and documents", slow but cheap), TurboPuffer (search icon, "AI vector embeddings", fast for semantic search).
- [x] **Mechanism screen — ER diagram (REQUIRED):** Mermaid ER diagram of core PostgreSQL schema. Show: Organization, Company, User, JournalEntry, JournalLine, Task, and their relationships. Use `erDiagram` syntax. This grounds the abstract "PostgreSQL stores business data" in actual tables. Label FK relationships. Callout: "Everything in Avise traces back to a Company. Companies belong to Organizations. Journal entries, tasks, and users all hang off companies — this is the tree that organizes all data."
- [x] **Mechanism screen — screen 3: SpiceDB explained:** Code-Walk of authorizationClient snippet. Key teaching: SpiceDB stores ONLY relationships — "User A is an admin of Company B" — not the actual business data. When you click "Can this user edit this task?", the app queries SpiceDB, not PostgreSQL. This makes permission checks fast and auditable. Callout: "Permission data and business data grow at different rates and have different access patterns. Mixing them in one database causes either slow permission checks or slow business queries. SpiceDB exists because permissions need to be their own system."
- [x] **Mechanism screen — screen 4: Redis + S3 + TurboPuffer:** Pattern cards (3 cards). Redis: "BullMQ stores job definitions here. If the server restarts, jobs aren't lost — they're in Redis waiting." S3: "Every file a user uploads goes straight to S3. The database stores only the file's S3 key (like a library card number), not the file itself." TurboPuffer: "When the AI needs to find semantically similar content ('find me journal entries about rent expense'), it queries TurboPuffer, not PostgreSQL."
- [x] **Application screen — screen 5:** Quiz, 3 questions:
  1. "A new user is added to Avise. Where is their permission to access Company X stored?" (SpiceDB — permissions database)
  2. "A user uploads a 50MB PDF. Where does the file content live? Where does the reference to it live?" (File → S3; reference/key → PostgreSQL)
  3. "The AI assistant needs to find journal entries that are 'semantically similar' to a user's question. Which database does it query?" (TurboPuffer — vector embeddings)

### Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Multiple-Choice Quizzes", "Code-Walk", "Callout Boxes", "Glossary Tooltips", "Icons (Lucide)", "Layout Utilities", "Inter-Module Navigation (Continue CTA)"
- `references/data-visualization.md` → "Pattern 1: Database Schema Diagram" (ER diagram — REQUIRED for this module), "Pattern 2: Architecture Preview Map"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

### Connections
- **Previous module:** Module 3 (How They Talk) — covered communication patterns between services
- **Next module:** Module 5 (The Outside World) — shifts from internal storage to external services Avise depends on
- **Tone/style notes:** Forest green accent. Storage systems have consistent names throughout: "PostgreSQL" (not "the database"), "SpiceDB" (not "the permissions DB"), "Redis" (not "the cache"). The ER diagram uses actual model names from the Prisma schema.
