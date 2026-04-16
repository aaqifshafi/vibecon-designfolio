# Vibecon Designfolio - PRD

## Original Problem Statement
1. Pull code from connected Git repository and run frontend locally
2. Wire up resume-to-portfolio builder functionality: PDF upload → Gemini parsing → IndexedDB storage → Builder data population

## Architecture
- **Repo**: github.com/aaqifshafi/vibecon-designfolio
- **Stack**: Vite 7.3 + React 19 + TypeScript + Tailwind CSS v4 + Wouter routing
- **Monorepo**: Root package.json with `client/`, `server/`, `shared/` dirs
- **Frontend runs via**: Supervisor → `/app/frontend/package.json` wrapper → Vite dev server on port 3000
- **Backend**: Not set up (per user request — all client-side)
- **Data Layer**: IndexedDB (`portfolioBuilder` / `resumeData`)
- **AI Integration**: Gemini 2.5 Flash (direct frontend API call)
- **PDF Parsing**: pdfjs-dist (client-side)

## User Personas
- Designers/developers wanting to quickly build a portfolio from their resume
- Job seekers uploading PDF resumes to auto-generate portfolio sites

## Core Requirements
- Upload PDF resume on landing page (`/`)
- Client-side PDF text extraction via PDF.js
- Gemini 2.5 Flash parses resume text into structured JSON
- IndexedDB stores ParsedResume data (single source of truth)
- Builder page (`/builder`) renders all sections from IndexedDB data
- Graceful fallbacks for missing fields
- Re-upload warning modal when existing data detected
- Empty IndexedDB → redirect `/builder` to `/`

## What's Been Implemented (2026-04-16)

### Session 1: Frontend Setup
- Pulled latest code from `main` branch
- Installed all npm dependencies
- Created `/app/frontend/package.json` wrapper for supervisor
- Vite dev server running on port 3000

### Session 2: Resume-to-Portfolio Wiring
- Created `client/src/lib/types.ts` — ParsedResume + ProjectItem interfaces
- Created `client/src/lib/indexeddb.ts` — IndexedDB CRUD (get/set/has)
- Created `client/src/lib/pdf.ts` — PDF.js text extraction
- Created `client/src/lib/gemini.ts` — Gemini 2.5 Flash API call + response parsing + project enforcement
- Created `client/src/context/ResumeContext.tsx` — React context for shared state
- Modified `App.tsx` — Wrapped in ResumeProvider
- Modified `landing.tsx`:
  - Wired Upload Resume button with IndexedDB check
  - Real processing pipeline (PDF.js → Gemini → IndexedDB → redirect)
  - Re-upload warning modal
  - Error states (non-PDF, malformed JSON, extraction failure)
  - Loading animation with sequential status messages
- Modified `home.tsx`:
  - IndexedDB hydration on mount
  - Dynamic hero (firstName, title)
  - Dynamic about/intro section
  - Dynamic experience list
  - Dynamic projects (synced from resume, exactly 2)
  - Dynamic tools/stack
  - Dynamic recommendations (hidden if empty)
  - Dynamic contact info (email, phone, social links — hidden if null)
  - Redirect to `/` if IndexedDB empty
- Modified `project.tsx`:
  - Dynamic project data from ResumeContext
  - Fallback to static data
  - Images assigned by slot position

## Testing Results
- Session 1: 12/13 tests passed (95%)
- Session 2: 11/12 tests passed (92%) — PDF upload pipeline untestable in automation

## Prioritized Backlog
- P0: None (all core wiring complete)
- P1: Backend setup (Express + PostgreSQL + Drizzle ORM) if needed
- P2: Editable fields in builder (currently read-only from resume)
- P2: PDF download/export of portfolio

## Next Tasks
- User testing with real PDF resume
- Backend setup if/when requested
