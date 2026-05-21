# My Personal Learning OS — Complete Build Plan

**Who this is for:** You. Zero technical knowledge required.  
**What this is:** A step-by-step plan to turn the current course collection into a
personal knowledge application — accessible from any device, with login, progress
tracking, notes, and AI chat.  
**How to use this document:** Read each phase fully before starting it. Copy the
"What to tell Copilot" boxes exactly as written.

---

## The Big Picture — What We Are Building

Right now you have a collection of HTML files that only open on your laptop.
By the end of this plan you will have:

- A real web address (URL) you can open on your tablet, phone, or any browser
- A login screen so only you can access it
- A dashboard that shows all your courses and where you left off
- A notes panel you can open on any page to write thoughts
- A chat assistant that knows what you are studying
- A place to add books, projects, and checklists over time

Think of it as **your personal Notion, but built exactly the way you want it**.

---

## The Ingredients — What Each Technology Does

Before you start, here is a plain-language explanation of every tool you will use.
You do not need to understand how they work internally — only what role they play.

---

### Git and GitHub

**What it is:** Git is like "track changes" in Word, but for code. Every time you
save a version of your project, Git remembers it. GitHub is the online storage
where those versions live — like Google Drive, but for code.

**Why you need it:** Your project files currently only exist on your laptop.
GitHub puts them in the cloud so Vercel (see below) can pick them up and publish
your site. It also means you never lose your work — every version is saved forever.

**Key vocabulary:**
- **Commit** = one saved snapshot of your project with a label ("added login page")
- **Push** = sending your local snapshots to GitHub
- **Repository (repo)** = your project folder on GitHub

---

### Vercel

**What it is:** A hosting service. It takes your code from GitHub and puts it on
the internet with a real web address.

**Why you need it:** A website needs to live on a computer that is always on and
always connected to the internet. You cannot use your laptop for this. Vercel
provides that computer — for free.

**Key vocabulary:**
- **Deploy** = the act of publishing your latest code to the internet
- **Build** = Vercel compiling your code before publishing it

---

### Supabase

**What it is:** A ready-made backend service. It gives you two things in one:
a **database** (a structured place to store information) and an **authentication
system** (login, logout, passwords).

**Why you need it:** Every time you tick a module as complete, or write a note,
or log in — that information needs to be saved somewhere permanent that is not
just your browser. Supabase is that permanent storage. It is free up to 500MB.

**Key vocabulary:**
- **Database** = organised storage, like a spreadsheet that your app can read/write
- **Row** = one entry in the database (one note, one completed module, one user)
- **Table** = a category of storage (a "notes" table, a "progress" table)
- **API key** = a secret password your app uses to talk to Supabase
- **Authentication** = the login/logout system

---

### Next.js

**What it is:** A framework — a structured way to build web applications. Think
of it as upgrading from a collection of individual HTML files to a proper
application with a shared structure, shared navigation, and shared logic.

**Why you need it:** Your current HTML files work fine for reading, but they
cannot talk to a database, handle login sessions, or share state between pages.
Next.js gives your app those capabilities. Copilot knows Next.js very well and
can build features in it quickly.

**Key vocabulary:**
- **Page** = one screen in your app (the dashboard is a page, each course is a page)
- **Component** = a reusable piece of UI (the navigation bar, a course card, a note panel)
- **API route** = a page that does not show anything visually but handles data
  (saving a note, fetching progress)
- **Server** = the part of your app that runs on Vercel and talks to Supabase
- **Client** = the part that runs in the browser and shows the UI

---

### Claude API

**What it is:** The same AI you are talking to right now, but accessible
programmatically — meaning your app can send it messages and get responses back.

**Why you need it:** To add a chat panel to your app where you can ask questions
about what you are studying. The chat knows which course and module you are on
because your app tells the API that context.

**Key vocabulary:**
- **API** = a set of rules for how your app talks to an external service
- **API key** = a secret password that proves your app is allowed to use Claude
- **Prompt** = the message your app sends to Claude
- **Context** = additional information you send alongside the question
  (e.g. "the user is on module 3 of the authentication course")

---

## Accounts You Need to Create Before Starting

Create these accounts now, before Phase 1. All are free.

| Service | Website | Why |
|---|---|---|
| GitHub | github.com | Where your code lives |
| Vercel | vercel.com | Where your app is hosted |
| Supabase | supabase.com | Your database and login system |
| Anthropic | console.anthropic.com | Your Claude API key for chat |

For each: sign up with your email, use a strong password, save it in a password manager.

---

---

# PHASE 1 — Get It Online

## What you will have when this is done

A real URL (something like `mihaelailie.vercel.app`) that you can open from
any browser on any device. The app looks exactly like it does now — nothing
changes visually. This phase is purely about putting what exists onto the internet.

## Why we do this first

Every phase after this one requires the app to be online. Doing this first also
means you can see your changes live immediately after every phase — no more
opening files from your laptop.

## Time estimate: 1–2 hours

---

## Step 1.1 — Make your first commit and push to GitHub

This saves all your current files to GitHub for the first time.

### What to tell Copilot:

```
I have a project in the folder /Users/mihaela.ilie/Cursuri-Claude/Documentation-
It is a git repository but has never had any commits.
The GitHub remote is already set to https://github.com/mihaelailie-design/Documentation-

Please help me:
1. Stage all files for the first commit
2. Create a commit with the message "initial commit: learning hub v1"
3. Push everything to the main branch on GitHub

Walk me through each command one at a time and explain what each one does.
```

### How you know it worked:
Go to `https://github.com/mihaelailie-design/Documentation-` in your browser.
You should see all your files listed there.

---

## Step 1.2 — Connect GitHub to Vercel and deploy

This publishes your site to the internet.

### What to do (no Copilot needed — this is all clicking):

1. Go to `vercel.com` and log in
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Find `mihaelailie-design/Documentation-` and click **Import**
5. On the next screen, leave everything as default — do not change any settings
6. Click **Deploy**
7. Wait 1–2 minutes. Vercel will give you a URL.

### What to tell Copilot if something goes wrong:

```
I am deploying a static HTML project to Vercel from GitHub.
The repo is mihaelailie-design/Documentation-
The project has no build step — it is plain HTML, CSS and JavaScript files.
Vercel is showing an error: [paste the exact error message here]
How do I fix this?
```

### How you know it worked:
Vercel shows a green checkmark and gives you a URL. Open that URL on your phone
or tablet — it should show your learning hub.

---

---

# PHASE 2 — Upgrade the Engine (Next.js Migration)

## What you will have when this is done

The app looks identical to the visitor, but under the hood it is now a Next.js
application. This is the foundation that every subsequent phase builds on.
Think of this as replacing the engine of a car — the outside looks the same,
but now it can do things it could not before.

## Why we do this

Your current HTML files are static — they cannot remember anything, cannot talk
to a database, cannot handle login. Next.js gives every page the ability to
connect to Supabase, check if you are logged in, and save data.

## Important note

This phase changes the structure of your project significantly. Your existing
courses will be imported into the new structure. **Nothing will be deleted.**
Copilot will handle the migration.

## Time estimate: 3–5 hours (done over multiple sessions)

---

## Step 2.1 — Scaffold the Next.js project

### What to tell Copilot:

```
I want to migrate my current static HTML learning hub to a Next.js application.
My current project is at /Users/mihaela.ilie/Cursuri-Claude/Documentation-

The current structure is:
- index.html (the hub landing page)
- avise.html (Avise courses catalog)
- knowledge.html (general knowledge catalog)
- briefs.html (planning briefs)
- assets/ (hub.css and hub-state.js)
- courses/ (17 folders, each with an index.html — the actual courses)
- briefs/ and patterns/ folders

I want to:
1. Create a new Next.js 14 project using the App Router
2. Recreate the existing pages (index, avise, knowledge, briefs) as Next.js pages
3. Keep the existing course HTML files accessible at their current URLs
4. Keep the exact same visual design (use the existing hub.css)

Please start by scaffolding the Next.js project and migrating the main navigation
structure. Do not change any visual design.
```

---

## Step 2.2 — Move the courses into Next.js

### What to tell Copilot:

```
I have migrated my learning hub to Next.js.
I have 17 course folders in /courses/, each with an index.html file.
These are self-contained interactive courses built in vanilla HTML/CSS/JS.

I want to serve them inside the Next.js app so they are accessible at paths
like /courses/autentificare, /courses/gh500, etc.
The courses should render exactly as they do now — do not modify their HTML.
Show me how to set this up.
```

---

## Step 2.3 — Deploy the migrated app

### What to tell Copilot:

```
I have migrated my learning hub from static HTML to Next.js.
I need to push this to GitHub and redeploy on Vercel.
The repo is mihaelailie-design/Documentation- and it is already connected to Vercel.
Walk me through committing and pushing the changes.
Also, are there any Next.js-specific settings I need to configure in Vercel?
```

### How you know it worked:
The Vercel URL shows the same hub you had before, but now built with Next.js.
All 17 courses open correctly.

---

---

# PHASE 3 — Add Login

## What you will have when this is done

A login screen that appears when you visit your URL. You enter your email and
password, and then your hub opens. Nobody else can access your content.

## Why we do this

Your hub will contain personal notes, progress, and eventually private work.
Login protects it. It also enables every other feature — the app needs to know
who you are to save your progress and notes against your account.

## Time estimate: 2–3 hours

---

## Step 3.1 — Set up Supabase

### What to do (clicking, no code):

1. Go to `supabase.com` and log in
2. Click **"New Project"**
3. Name it `learning-os`
4. Choose a strong database password and save it
5. Select the region closest to you (Europe West if you are in Romania)
6. Click **Create new project** — wait 2 minutes
7. Once created, go to **Settings → API**
8. Copy two values and save them somewhere safe:
   - `Project URL` (looks like `https://xxxx.supabase.co`)
   - `anon public` key (a long string of letters and numbers)

These are your Supabase credentials. Your app uses them to talk to your database.

---

## Step 3.2 — Add Supabase to your Next.js app

### What to tell Copilot:

```
I want to add authentication to my Next.js 14 app using Supabase.
My Supabase project URL is: [paste your URL]
My Supabase anon key is: [paste your key]

Please:
1. Install the Supabase client library
2. Create a Supabase client configuration file
3. Store the credentials as environment variables (not hardcoded in files)
4. Show me how to set these environment variables in Vercel

I am using Next.js 14 with the App Router.
```

---

## Step 3.3 — Create the login page

### What to tell Copilot:

```
I want to create a login page for my Next.js learning hub using Supabase Auth.
Requirements:
- The page should be at /login
- It should have an email and password field
- It should match the existing visual style of the hub (dark sidebar, clean white main area)
- After successful login, redirect to the hub home page (/)
- If the user is not logged in and tries to visit any page, redirect them to /login
- I am the only user — I will create my account directly in the Supabase dashboard

Please create the login page and the middleware that protects all routes.
```

---

## Step 3.4 — Create your account

### What to do (clicking, no code):

1. Go to your Supabase project dashboard
2. Click **Authentication** in the left sidebar
3. Click **Users**
4. Click **Invite user** (or **Add user**)
5. Enter your email and a strong password
6. Your account is created

### How you know it worked:
Go to your Vercel URL. You should see a login screen. Enter your email and password.
You should be taken to the hub home page.

---

---

# PHASE 4 — Progress Tracking

## What you will have when this is done

When you finish a module in any course and click "Mark complete", that progress
is saved permanently. A small progress indicator appears on each course card
showing how far through you are. This syncs across all your devices.

## Why we do this

Right now, if you close the browser, all progress is lost. The current app uses
"localStorage" — a temporary storage that only exists in one browser on one
device. Moving progress to Supabase makes it permanent and cross-device.

## Time estimate: 2–3 hours

---

## Step 4.1 — Create the progress table in Supabase

### What to do (clicking, no code):

1. In your Supabase dashboard, click **Table Editor**
2. Click **New Table**
3. Name it `module_progress`
4. Add these columns (click the + button for each):

| Column name | Type | Notes |
|---|---|---|
| id | int8 | Primary key, auto-generated — leave as default |
| user_id | uuid | The logged-in user's ID |
| course_id | text | e.g. "autentificare" |
| module_id | text | e.g. "module-3" |
| completed_at | timestamptz | When it was completed |

5. Click **Save**

---

## Step 4.2 — Connect the courses to the progress table

### What to tell Copilot:

```
I want to add progress tracking to my Next.js learning hub using Supabase.
I have created a table called module_progress with these columns:
- id (auto-generated)
- user_id (uuid)
- course_id (text)
- module_id (text)
- completed_at (timestamptz)

The courses are self-contained HTML files that already have "Mark complete" buttons.
These buttons currently call a JavaScript function called markComplete(moduleId).

I need to:
1. Intercept that markComplete function to also save to Supabase
2. On page load, read from Supabase to restore completed modules
3. Show a progress percentage on each course card in the knowledge.html and avise.html catalog pages

Please show me how to do this with the Supabase JS client.
The user is already logged in via Supabase Auth.
```

---

## Step 4.3 — Show progress on course cards

### What to tell Copilot:

```
In my Next.js learning hub, I want to show course progress on the course catalog
pages (knowledge page, avise page).

For each course card, I want to show a small progress bar and a percentage
(e.g. "3 / 7 modules complete — 43%").

The data comes from the module_progress Supabase table.
Each course has a known number of modules (hardcoded is fine for now).

Please update the course card components to fetch and display this progress.
```

### How you know it worked:
Complete a module in a course. Open the course catalog. You see a progress bar
on that course card. Open the same page on your phone — the progress is there too.

---

---

# PHASE 5 — Notes

## What you will have when this is done

A notes panel that can be opened on any page with a keyboard shortcut or button.
You type your thoughts, and they are saved permanently linked to that specific
course and module. A search lets you find notes across all your content.

## Time estimate: 2–3 hours

---

## Step 5.1 — Create the notes table in Supabase

### What to do (clicking, in Supabase Table Editor):

Create a new table called `notes` with these columns:

| Column name | Type | Notes |
|---|---|---|
| id | int8 | Primary key, auto-generated |
| user_id | uuid | The logged-in user |
| course_id | text | Which course (can be null for general notes) |
| module_id | text | Which module (can be null) |
| content | text | The note text |
| created_at | timestamptz | When written |
| updated_at | timestamptz | When last edited |

---

## Step 5.2 — Build the notes panel

### What to tell Copilot:

```
I want to add a floating notes panel to my Next.js learning hub.
Requirements:
- A small "Notes" button fixed in the bottom-right corner of every page
- Clicking it opens a side panel (slides in from the right)
- The panel has a text area where I can type notes
- Notes are saved automatically after 1 second of not typing (autosave)
- Notes are linked to the current course and module (read from the URL)
- Previous notes for the current course/module are loaded automatically
- There is a "All notes" view that shows every note I have ever written, searchable

Data goes to the Supabase notes table.
The visual style should match the hub (same fonts, same color palette).
Please build the NotesPanel component and add it to the global layout.
```

---

---

# PHASE 6 — The Dashboard

## What you will have when this is done

A homepage that is actually useful — not just a list of courses, but a real
overview of where you are. It shows: courses in progress, recently added notes,
courses not yet started, time spent this week, and quick links to continue where
you left off.

## Time estimate: 2–3 hours

---

## Step 6.1 — Design the dashboard (before any code)

Before telling Copilot to build anything, decide what you want to see.
Sketch it on paper or describe it. Here is a suggested starting layout:

**Top row:** Three summary numbers
- Total courses: 17
- Modules completed: X / total
- Notes written: X

**Middle section: "Continue learning"**
- The 3 courses you most recently touched, with progress bars
- A "Continue" button that takes you to the last module you were on

**Bottom section: "Recent notes"**
- Your last 5 notes with course names and dates
- A link to all notes

---

## Step 6.2 — Build the dashboard

### What to tell Copilot:

```
I want to build a dashboard page for my Next.js learning hub.
It should be the home page (route: /).

Data sources (all from Supabase):
- module_progress table: to calculate completion percentages
- notes table: to show recent notes
- Course list (hardcoded for now): 17 courses, each with a known module count

Dashboard sections I want:
1. Three stat cards at the top: total modules completed, total notes, courses in progress
2. "Continue learning" section: the 3 most recently active courses with progress bars
   and a direct link to the last module completed
3. "Recent notes" section: last 5 notes with course name, module name, date, and
   a short preview of the text

Visual style: match the existing hub design (same fonts, same white/dark palette).
```

---

---

# PHASE 7 — AI Chat

## What you will have when this is done

A chat button on every course page. You click it, a chat window opens, and you
can ask questions about what you are studying. The assistant knows which course
and module you are on. It can explain concepts differently, give you examples,
quiz you, or help you make notes.

## Time estimate: 3–4 hours

---

## Step 7.1 — Get your Claude API key

### What to do (clicking, no code):

1. Go to `console.anthropic.com`
2. Log in or create an account
3. Click **API Keys** in the left menu
4. Click **Create Key**
5. Name it `learning-os`
6. Copy the key (starts with `sk-ant-...`) and save it somewhere safe
7. You will be charged a very small amount each time you use the chat — typically
   less than €0.01 per conversation. You can set a monthly budget limit.

---

## Step 7.2 — Create a chat API route

### What to tell Copilot:

```
I want to add an AI chat feature to my Next.js learning hub using the Claude API
(Anthropic SDK).

I have a Claude API key: [paste your key - or add it as env variable first]

Requirements:
1. Create a Next.js API route at /api/chat that:
   - Accepts: the user's message, the current course ID, and the current module ID
   - Builds a system prompt that tells Claude: "You are a study assistant. The user
     is currently studying [course name], specifically [module name]. Help them
     understand concepts, answer questions, and suggest connections to what they
     are learning."
   - Sends the message to Claude claude-sonnet-4-6
   - Returns the response as a stream (so text appears word by word, not all at once)

2. Build a ChatPanel component (similar to the NotesPanel from Phase 5):
   - Fixed button in the bottom-left corner
   - Slides in from the left as a panel
   - Shows conversation history for the current session
   - Input field at the bottom
   - "Clear conversation" button

3. Add the ChatPanel to the global layout so it appears on every course page.

Please also store the API key as an environment variable called ANTHROPIC_API_KEY,
not hardcoded in the code.
```

---

## Step 7.3 — Add the API key to Vercel

### What to do (clicking, no code):

1. Go to `vercel.com` and open your project
2. Click **Settings**
3. Click **Environment Variables**
4. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste your API key
5. Click **Save**
6. Redeploy (click **Deployments** → **Redeploy**)

### How you know it worked:
Open a course, click the chat button, ask "Can you summarise what I am learning
in this module?" — you should get a relevant response.

---

---

# PHASE 8 — Books, Projects, Checklists

## What you will have when this is done

New sections in your hub for content that is not a course:
- **Books** — a reading list with notes per book, progress through chapters
- **Projects** — a place to link or describe your own work
- **Checklists** — reusable checklists (for PRs, for sprints, for anything)

## Time estimate: 4–6 hours (can be done one section at a time)

---

## Step 8.1 — Books

### What to tell Copilot:

```
I want to add a Books section to my Next.js learning hub.
Route: /books

Each book entry should have:
- Title and author
- A cover image (optional, uploaded manually)
- My rating (1–5 stars)
- Reading status (Want to read / Reading / Finished)
- Chapter-level notes (same NotesPanel component I already have)
- A progress bar (current chapter / total chapters)

All data stored in Supabase. I should be able to add and edit books from within
the app (a simple form, no admin panel needed).

Create:
1. A books table in Supabase with these fields
2. The /books catalog page
3. The /books/[id] individual book page
4. An "Add book" form

Match the existing hub visual style.
```

---

## Step 8.2 — Checklists

### What to tell Copilot:

```
I want to add a Checklists section to my Next.js learning hub.
Route: /checklists

Requirements:
- I can create a checklist with a title and any number of items
- I can check/uncheck items — state is saved to Supabase
- I can create multiple instances of a checklist template
  (e.g. a "PR review checklist" that I use for every PR)
- Checklists can be tagged (e.g. "work", "learning", "personal")

Create the Supabase tables, the catalog page, and the individual checklist page.
Match the existing hub visual style.
```

---

---

# Summary: What You Are Building in Order

| Phase | What you get | Complexity | Time |
|---|---|---|---|
| 1 | Real URL, works on any device | Very easy | 1–2h |
| 2 | Upgraded engine (Next.js) | Medium (Copilot does it) | 3–5h |
| 3 | Login screen | Easy | 2–3h |
| 4 | Persistent progress tracking | Medium | 2–3h |
| 5 | Notes on any page | Medium | 2–3h |
| 6 | Dashboard | Medium | 2–3h |
| 7 | AI chat | Medium | 3–4h |
| 8 | Books, projects, checklists | Easy per section | 4–6h total |

**Total:** approximately 20–30 hours of work, done in sessions.
Each phase is a complete, usable improvement on its own.
You do not need to do them all at once.

---

---

# How to Work with Copilot Effectively

## The golden rule

**Always give Copilot context.** Never say "add a button here". Say:
"I am building a Next.js 14 learning hub. It uses Supabase for data storage
and has a notes feature. I want to add a button that..."

The more context, the better the output.

## When Copilot gives you code

1. Ask it to explain what the code does in plain language before you run it
2. If something does not work, paste the exact error message and say: "I got this
   error. What does it mean and how do I fix it?"
3. Never paste code from one Copilot session into another without re-explaining
   the context

## When you are stuck

Say this:

```
I am following a step-by-step plan to build a personal learning hub with Next.js
and Supabase. I am currently on Phase [X], Step [Y].

The goal of this step is: [describe it]
I have done: [what you tried]
The problem is: [what went wrong, paste any error messages]

What should I do next?
```

## Keeping the plan updated

As you complete each phase, come back to this file and mark the phase as done.
You can use Copilot for that too: "Update my PLAN.md to mark Phase X as complete."

---

# Glossary — Every Technical Word in This Document

| Word | Plain English explanation |
|---|---|
| API | A way for two pieces of software to talk to each other |
| API key | A secret password that proves your app is allowed to use a service |
| App Router | The navigation system in Next.js 14 (how URLs map to pages) |
| Authentication | The system that handles login and logout |
| Build | Compiling code into something Vercel can serve |
| Client | The part of your app that runs in the browser |
| Commit | A saved snapshot of your code with a description |
| Component | A reusable piece of UI (a button, a card, a sidebar) |
| Database | Organised, permanent storage for information |
| Deploy | Publishing your latest code to the internet |
| Environment variable | A secret setting stored outside your code (like an API key) |
| Framework | A set of rules and tools that structure how you build an app |
| Git | Software that tracks changes to your files |
| GitHub | Online storage for Git projects |
| localhost | Your own laptop — "localhost:3000" means the app running on your computer |
| Middleware | Code that runs before every page loads (e.g. checking if you are logged in) |
| Migration | Moving your project from one structure or tool to another |
| Next.js | A framework for building web applications with React |
| npm | A tool that installs code libraries your app depends on |
| Page | One screen in your app |
| Push | Sending your local commits to GitHub |
| React | A library for building user interfaces — Next.js is built on top of it |
| Repository (repo) | A project folder tracked by Git |
| Route | A URL path in your app (e.g. `/courses/autentificare`) |
| Row | One entry in a database table |
| Server | A computer (on Vercel) that runs your app and is always online |
| Static HTML | Web files that have no dynamic behaviour — they cannot save data |
| Stream | Sending data piece by piece as it arrives (chat text appearing word by word) |
| Supabase | A service that gives you a database and login system |
| Table | A category of storage in a database |
| Vercel | A hosting service that publishes your app to the internet |
