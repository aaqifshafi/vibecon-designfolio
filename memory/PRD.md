# Vibecon Designfolio - PRD

## Architecture
- **Stack**: Vite 7.3 + React 19 + TypeScript + Tailwind CSS v4 + Wouter + @dnd-kit + @anam-ai/js-sdk
- **Data**: IndexedDB (`portfolioBuilder` v2)
- **APIs**: Gemini 2.5 Flash, JSearch/RapidAPI, Nominatim, Anam.ai (avatar)
- **Keys in `.env.local`**: VITE_GEMINI_API_KEY, VITE_RAPIDAPI_KEY, VITE_ANAM_API_KEY

## Implemented Features

### 1. Resume-to-Portfolio Builder (/ → /builder)
- PDF upload → PDF.js → Gemini parsing → IndexedDB → dynamic builder

### 2. Jobs Stepper (/jobs gate)
- 3-step stepper: experience level, location (Nominatim), target role
- JSearch 3 pages parallel → Gemini ranking → Kanban

### 3. Jobs Kanban Board (/jobs)
- 5 columns: AI Picks, Shortlisted, Applied, Interview, Offer
- Drag-and-drop, IndexedDB persistence, "Search again"

### 4. AI Mock Interview (Anam Avatar)
- "Take Mock Interview" button on Interview column cards only
- Full-screen modal: resume→portfolioContext→systemPrompt→Anam session→avatar stream
- Kevin avatar conducts structured interview based on JD + portfolio
- Error states: permission denied, no resume, session failure
- End Interview destroys session, returns to Kanban

## Files
- `lib/`: types, indexeddb, pdf, gemini, gemini-jobs, job-types, jobs-db, job-preferences-db, jsearch, anam-interview
- `components/`: jobs-stepper, interview-modal
- `pages/`: landing, home, project, jobs
