# Vibecon Designfolio - PRD

## Architecture
- **Stack**: Vite 7.3 + React 19 + TypeScript + Tailwind CSS v4 + Wouter + @dnd-kit + @anam-ai/js-sdk
- **Data**: IndexedDB (`portfolioBuilder` v2)
- **APIs**: Gemini 2.5 Flash, JSearch/RapidAPI, Nominatim, Anam.ai

## Implemented Features
1. Resume-to-Portfolio Builder (/ → /builder)
2. Jobs Stepper + Kanban Board (/jobs - Board view)
3. AI Mock Interview (Anam Avatar) + Feedback Report
4. Ask Scout — Per-Job AI Chat
5. Offer Decision Assistant (conversational stepper)
6. **COSMOS — Constellation Job Explorer (NEW)**
   - Board ↔ Cosmos toggle in header
   - Dark space background with radial gradient
   - User at center, jobs as glowing stars
   - Star properties: size=weight, glow=resonance, color=companyType
   - Clustering by company type (startup/mid/enterprise/agency)
   - Hover: tooltip with company, role, emotional insight
   - Click: OFERTA side panel with "Why this fits you", emotional quote, apply CTA
   - Gemini computes emotional alignment (distance, resonance, weight, insights)
   - Fallback layout when Gemini unavailable
   - Legend showing company type colors
   - Job title clickable in Kanban → opens same OFERTA panel
   - NO scores shown (per PRD rule)
