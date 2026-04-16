# Designfolio — AI Career Hub PRD

## Original Problem Statement
Pull code from connected public Git repository, install dependencies, fix build errors, and run the Vite frontend development server locally. Then wire up a Resume-to-Portfolio builder (PDF extraction to Gemini to IndexedDB), build a Kanban Job tracking board populated via RapidAPI JSearch and ranked by Gemini, add a pre-gate Job Onboarding Stepper, integrate Anam.ai for Mock Interviews on job cards, build a context-aware "Ask Scout" AI chat, add an Offer Decision assistant, implement a "COSMOS" 2D constellation job explorer, optimize Gemini ranking logic using embeddings, display company logos and replace match score text with a new visual Gauge component.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + Framer Motion + Wouter
- **Storage**: IndexedDB (client-side only, no backend)
- **APIs**: Gemini (ranking/chat/scoring/embeddings), RapidAPI/JSearch (jobs), Anam.ai (video avatars), Nominatim OSM (location)
- **Keys**: `/app/client/.env.local` (VITE_GEMINI_API_KEY, VITE_RAPIDAPI_KEY, VITE_ANAM_API_KEY)

## Completed Features
1. Git clone + Vite dev server setup
2. Resume-to-Portfolio Builder (PDF parse -> Gemini -> IndexedDB)
3. `/jobs` Kanban Board (RapidAPI JSearch + Gemini ranking)
4. API keys in `.env.local` + Vercel deployment config
5. Jobs Onboarding Stepper (Nominatim location autocomplete)
6. Vite HMR full-page refresh bug fix
7. Anam.ai Video Mock Interview Modal
8. AI Interview Feedback Report generation
9. "Ask Scout" per-job AI Chat
10. Offer Decision Assistant (conversational flow for >= 2 offers)
11. COSMOS Constellation view with gravity filters
12. Individual embedding/heuristic Gemini ranking (no more 50% clustering)
13. JSearch country code resolution from Nominatim
14. Company logos on JobCard and JobDetailPanel (employer_logo from JSearch)
15. Gauge component (full 21st.dev/designali-in/gauge-1 registry version) replacing text match scores
16. UI cleanup: Compact 24px gauge ring + text in cards, 42px labeled gauge in detail panel header, logos only when available, no fallback placeholder blocks

## Key Files
- `/app/client/src/pages/jobs.tsx` — Kanban board + inline JobCard component
- `/app/client/src/components/job-detail-panel.tsx` — Slide-out detail panel
- `/app/client/src/components/ui/gauge-1.tsx` — Full 21st.dev gauge component (multiRing, thresholds, tickMarks, glow)
- `/app/client/src/lib/jsearch.ts` — JSearch API integration (maps employer_logo)
- `/app/client/src/lib/job-types.ts` — JobItem type (includes employerLogo field)

## Backlog
- No pending tasks from PRDs. All requested features are implemented.
