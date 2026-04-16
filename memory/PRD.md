# Vibecon Designfolio - PRD

## Architecture
- **Stack**: Vite 7.3 + React 19 + TypeScript + Tailwind CSS v4 + Wouter + @dnd-kit
- **Data**: IndexedDB (`portfolioBuilder` v2, stores: `resumeData`, `jobPreferences`, `jobsData`)
- **APIs**: Gemini 2.5 Flash (resume parsing + job ranking), JSearch/RapidAPI (real job listings), Nominatim (location autocomplete)
- **Keys**: `.env.local` (gitignored) — `VITE_GEMINI_API_KEY`, `VITE_RAPIDAPI_KEY`

## Implemented Features

### 1. Resume-to-Portfolio Builder (/)→(/builder)
- PDF upload → PDF.js extraction → Gemini parsing → IndexedDB → /builder
- Dynamic hero, about, experience, projects (2), tools, recommendations, contact/social links
- Re-upload warning modal, error states, fallbacks

### 2. Jobs Onboarding Stepper (/jobs gate)
- Screen 0: Intro ("1,200+ jobs found")
- Screen 1: Experience level (4 cards → API param mapping)
- Screen 2: Location (3 options + Nominatim autocomplete, pre-fills from resume)
- Screen 3: Target role (free text + 6 quick-select chips)
- On submit: prefs → IndexedDB, JSearch 3 pages in parallel, Gemini ranking

### 3. Jobs Kanban Board (/jobs)
- 5 columns: AI Picks, Shortlisted, Applied, Interview, Offer
- Real JSearch job cards with title, company, location, salary, match score, apply link
- Drag-and-drop between columns, persisted to IndexedDB
- "Search again" clears prefs and restarts stepper
- Floating nav (Builder + Jobs)

## Files
- `lib/`: types.ts, indexeddb.ts, pdf.ts, gemini.ts, gemini-jobs.ts, job-types.ts, jobs-db.ts, job-preferences-db.ts, jsearch.ts
- `context/`: ResumeContext.tsx
- `components/`: jobs-stepper.tsx
- `pages/`: landing.tsx, home.tsx, project.tsx, jobs.tsx
- `client/.env.local` (gitignored), `client/.env.example`
