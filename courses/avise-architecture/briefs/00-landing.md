# Module 0: Landing — The Map You Wish You Had

### Teaching Arc
- **Metaphor:** A city map handed to you before a walking tour. Without it, every street looks the same. With it, you can see where you are, where things lead, and why roads were built where they were.
- **Opening hook:** "Every developer joining Avise hits the same wall on day one: the codebase is 24+ workspaces, three databases, five ways things communicate, and a dozen external services. This course is the map."
- **Key insight:** Avise is not one app — it is a system of specialized services that each handle one thing well. Understanding the system means understanding the contracts between them, not just any single piece.
- **"Why should I care?":** Once you have this map, you can trace any bug to its source, make informed decisions about where to add new code, and know exactly which system to blame when something goes wrong.

### Course overview cards (for the TOC bento grid)
- Module 1: Trace one user action through all 7 layers of the system — ~10 min
- Module 2: Meet every service and technology — ~15 min
- Module 3: Learn the 5 ways services communicate and why each exists — ~15 min
- Module 4: See where every type of data lives and why — ~10 min
- Module 5: Understand every external service and what breaks if it goes down — ~10 min
- Module 6: Learn how to trace a real bug through the full stack — ~10 min

Total: ~70 minutes · 6 modules · For engineers new to Avise

### Interactive Elements
- [ ] **Course landing (Module 0 pattern):** Eyebrow + hero title + subtitle + bento grid of "What you'll learn" cards (one per module) + visual TOC with module numbers and brief description
- No quiz — landing module only

### Reference Files to Read
- `references/interactive-elements.md` → "Course Landing / Overview (Module 0)", "Composition Patterns", "Icons (Lucide)", "Layout Utilities"
- `references/content-philosophy.md` → entire file
- `references/gotchas.md` → entire file

### Connections
- **Previous module:** None — this is the start
- **Next module:** Module 1 (One Click, Seven Layers) — traces a real user action end to end
- **Tone/style notes:** Accent color is forest green (`#2D8B55`). Services are always named consistently: "avise-web" / "avise-api" / "avise-domains" / "avise-shared-utils". External tools by proper name: "PostgreSQL" / "Redis" / "SpiceDB" / "Auth0" / "DataDog".
