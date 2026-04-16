# Vibecon Designfolio - PRD

## Original Problem Statement
1. Pull code from connected Git repository and run frontend locally
2. Wire up resume-to-portfolio builder: PDF upload → Gemini parsing → IndexedDB → Builder population
3. Build /jobs page with Kanban board: AI Picks, Shortlisted, Applied, Interview, Offer

## Architecture
- **Stack**: Vite 7.3 + React 19 + TypeScript + Tailwind CSS v4 + Wouter routing
- **Data Layer**: IndexedDB (`portfolioBuilder` / `resumeData`, version 2)
- **AI**: Gemini 2.5 Flash (resume parsing + job matching)
- **PDF**: pdfjs-dist (client-side)
- **DnD**: @dnd-kit (existing kanban.tsx component)
- **No backend**

## What's Been Implemented

### Resume-to-Portfolio Builder
- PDF upload → PDF.js text extraction → Gemini parsing → IndexedDB → /builder
- ResumeContext for shared state, re-upload warning modal, error handling
- Builder dynamically populates: hero name/title, about, experience, projects (2), tools, recommendations (hidden if empty), contact/social links (hidden if null)

### Jobs Kanban Board (/jobs)
- 5 drag-and-drop columns: AI Picks, Shortlisted, Applied, Interview, Offer
- Gemini generates AI-matched job picks from resume data
- Job cards show: title, company, location, salary, match score, tags, posted date
- Drag jobs between columns, persisted in IndexedDB
- Floating nav with Builder + Jobs links
- Error handling for API failures

## Files Created/Modified
- `client/src/lib/types.ts`, `indexeddb.ts`, `pdf.ts`, `gemini.ts`
- `client/src/lib/job-types.ts`, `jobs-db.ts`, `gemini-jobs.ts`
- `client/src/context/ResumeContext.tsx`
- `client/src/pages/jobs.tsx` (NEW)
- Modified: `App.tsx`, `landing.tsx`, `home.tsx`, `project.tsx`, `floating-nav.tsx`

## Testing: 95% pass rate (13/14)
