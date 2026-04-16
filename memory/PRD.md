# Vibecon Designfolio - PRD

## Architecture
- **Stack**: Vite 7.3 + React 19 + TypeScript + Tailwind CSS v4 + Wouter + @dnd-kit + @anam-ai/js-sdk
- **Data**: IndexedDB (`portfolioBuilder` v2)
- **APIs**: Gemini 2.5 Flash (resume parsing, job ranking, interview reports, Scout chat), JSearch/RapidAPI, Nominatim, Anam.ai

## Implemented Features
1. Resume-to-Portfolio Builder (/ → /builder)
2. Jobs Stepper + Kanban Board (/jobs)
3. AI Mock Interview (Anam Avatar) + Feedback Report
4. Ask Scout — Per-Job AI Chat (NEW)
   - "Ask Scout" button on every job card across all Kanban columns
   - Floating 380x520 chat window, bottom-right, doesn't push Kanban
   - Welcome state: avatar, heading, job context pill, 4 suggestion chips
   - Gemini-powered responses using job JD + ParsedResume context
   - System prompt injected once per session with full job + resume context
   - 20 message history cap, session-only (no persistence)
   - Multi-job: switching resets conversation, single window
   - Markdown rendering, typing indicator, error states with retry
   - Online/offline detection
