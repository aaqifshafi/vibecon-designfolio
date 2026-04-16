# Vibecon Designfolio - PRD

## Architecture
- **Stack**: Vite 7.3 + React 19 + TypeScript + Tailwind CSS v4 + Wouter + @dnd-kit + @anam-ai/js-sdk
- **Data**: IndexedDB (`portfolioBuilder` v2)
- **APIs**: Gemini 2.5 Flash (resume, jobs, reports, Scout, offer decisions), JSearch/RapidAPI, Nominatim, Anam.ai

## Implemented Features
1. Resume-to-Portfolio Builder (/ → /builder)
2. Jobs Stepper + Kanban Board (/jobs)
3. AI Mock Interview (Anam Avatar) + Feedback Report
4. Ask Scout — Per-Job AI Chat
5. **Offer Decision Assistant (NEW)**
   - "Help me choose" card in Offer column when ≥2 jobs
   - Opens guided 6-question stepper inside Scout's chat window
   - Questions: priority, salary range, work mode, optimization, risk preference, company preference
   - Submits all preferences + offer data to Gemini
   - Renders structured comparison: recommendation with confidence %, pros/cons per offer, reasoning
   - Error handling with retry
   - Progress bar (Question X of 6)

## New Files
- `lib/offer-decision.ts` — Gemini prompt + structured JSON output
- `components/offer-decision-chat.tsx` — Stepper + comparison UI
- Modified: `pages/jobs.tsx` — Help me choose card + state
