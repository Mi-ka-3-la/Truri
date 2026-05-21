# Module 5: The Outside World

### Teaching Arc
- **Metaphor:** A restaurant that doesn't grow its own food, make its own uniforms, or print its own receipts. It depends on suppliers. The kitchen works great — until the bread supplier has a delivery delay, or the POS system goes offline. Avise depends on 8 external services. Each dependency is a potential point of failure.
- **Opening hook:** "Avise doesn't do everything itself. Authentication is handled by Auth0. Accounting data syncs from QuickBooks Online. Notifications go through Knock. Errors are caught by DataDog. Feature flags are controlled by Split.io. Remove any one of these, and a part of Avise stops working. Knowing what each does — and what breaks without it — is essential architectural knowledge."
- **Key insight:** External services are categorized by what happens when they fail: HARD dependencies (app breaks immediately: Auth0, PostgreSQL), SOFT dependencies (feature degrades: Split.io, Knock), and ASYNC dependencies (work queues up but catches up: QBO sync, NetSuite sync, DataDog).
- **"Why should I care?":** When an incident happens, knowing which external service is down tells you immediately whether it's fixable by the Avise team or a vendor issue. This is the difference between a 15-minute incident response and a 2-hour debugging session.

### Code Snippets (pre-extracted)

**File: avise-api/src/app.ts (startup — feature flags)**
```ts
// Wait for the Split SDK to be ready before accepting requests
await FeatureFlagsClient.waitUntilReady();
```

**File: avise-shared-utils/src/featureFlags/index.ts (lines 1-30)**
```ts
import { SplitFactory } from "@splitsoftware/splitio";
import { FALLBACK_FEATURE_FLAGS, FeatureFlagName } from "./config";

class FeatureFlagsClient {
  // If Split.io is unreachable, FALLBACK_FEATURE_FLAGS kicks in.
  // The app doesn't crash — features just default to their safe fallback values.
}
```

**File: avise-api/src/config/index.ts (facet-based config)**
```ts
// Each external service has its own config module with Joi validation.
// If a required env var is missing in production, the app refuses to start.
import { auth0Config, Auth0Config, auth0ConfigJoiSchema } from "avise-shared-utils/auth0";
import { datadogConfig, DatadogConfig, datadogConfigJoiSchema } from "avise-shared-utils/datadog";
import { awsConfig, AwsConfig, awsConfigJoiSchema } from "avise-shared-utils/aws";
import { aviseDocsConfig, AviseDocsConfig } from "avise-shared-utils/aiTools/aviseDocs";
```

**Knock integration summary (from knock/README.md):**
Knock manages notification workflows — email, in-app, SMS. Avise defines workflow templates in the Knock dashboard. The API triggers a workflow by sending an event: `await knock.trigger('task-assigned', { recipients: [userId], data: { taskId } })`. Knock handles the actual sending, templating, and delivery tracking.

### Interactive Elements
- [x] **Anchor screen (Pattern A):** 8-service grid with dependency category badges. Services: Auth0 (key-round icon, HARD — "Authentication stops working"), PostgreSQL is covered in Module 4 so skip. Show: Auth0 (authentication), AWS S3 (file storage), DataDog (observability), Split.io (feature flags), Knock (notifications), QuickBooks Online (accounting sync), NetSuite (ERP sync), TurboPuffer (AI search). Each card shows: icon, name, what it does in one line, failure impact badge (Hard/Soft/Async).
- [x] **Mechanism screen (Pattern B) — screen 2: Auth0:** Auth0 handles who you ARE (authentication). SpiceDB (covered in Module 4) handles what you can DO (authorization). These are separate concerns. Auth0 gives back a JWT token. Every API request includes that token. The API validates it before doing anything. Callout: "Authentication = 'Who are you?' Authorization = 'What are you allowed to do?' Avise uses Auth0 for the first and SpiceDB for the second. Never mix them up — Auth0 has no idea about companies or tasks."
- [x] **Mechanism screen (Pattern B) — screen 3: Feature Flags — Conditional Flow Map (REQUIRED):** Split.io feature flags control which code path runs. Show a Conditional Flow Map: Toggle "enableNewSearch ON" → request goes through new search pipeline. Toggle "OFF" → request goes through legacy pipeline. Code: the `FeatureFlagsClient.waitUntilReady()` startup call + the FALLBACK_FEATURE_FLAGS safety net. This is the feature flag screen required by content-philosophy.md. Explain: what happens when Split.io is down (fallback values activate), why flags exist (gradual rollouts, kill switches, A/B tests).
- [x] **Mechanism screen (Pattern B) — screen 4: QBO/NS Sync + DataDog:** Group chat animation showing an accounting sync. Actors: Avise (A) / QuickBooks Online (Q) / DataDog (D). A→Q: "Give me transactions for Company X since last sync." Q→A: "Here are 847 transactions." A→A: "Map QBO fields to Avise schema." A→PostgreSQL: "Insert 847 rows." A→D: "Log: sync completed, 847 rows, 12.3s." D→D: "Alert if > 30s next time." Use id="chat-qbo-sync". Callout: "DataDog is the flight recorder. It doesn't change what happens — it records everything so you can replay it later when something goes wrong."
- [x] **Application screen (Pattern C) — screen 5:** Quiz, 4 questions:
  1. "Users report they can't log into Avise. The API server is running fine. Which external service is most likely the cause?" (Auth0)
  2. "A new feature is being rolled out to 10% of companies first. Which external service enables this?" (Split.io feature flags)
  3. "A user uploads a file. 30 minutes later they try to download it and get a 404. The Avise API is healthy. Which service is most likely involved?" (AWS S3)
  4. "The accounting sync for a company hasn't run in 6 hours. Where would you look to find out why?" (DataDog logs + BullMQ/Argo job queue)

### Reference Files to Read
- `references/interactive-elements.md` → "Composition Patterns", "Conditional Flow / Feature Flag Map", "Group Chat Animation", "Multiple-Choice Quizzes", "Code-Walk", "Callout Boxes", "Glossary Tooltips", "Icons (Lucide)", "Layout Utilities", "Inter-Module Navigation (Continue CTA)"
- `references/content-philosophy.md` → entire file (especially "Rules, Exceptions, and Conditional Behavior")
- `references/gotchas.md` → entire file

### Connections
- **Previous module:** Module 4 (Where Things Live) — covered internal storage systems
- **Next module:** Module 6 (Reading the System) — final module teaches how to trace bugs through all these layers
- **Tone/style notes:** Forest green accent. Use proper service names: "Auth0" (not "the auth system"), "Split.io" (not "feature flags tool"), "DataDog" (not "the monitoring system").
