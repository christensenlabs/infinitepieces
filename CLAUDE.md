# Infinite Pieces AI — Infinite Suite OS

Enterprise ABA (Applied Behavior Analysis) clinic management dashboard.

## Tech Stack

- React 18 + React Router v6
- Vite (dev/build)
- Tailwind CSS
- Google Gemini API for AI features (copilot, briefings, surge forecasting)

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint check
npm run lint:fix   # ESLint autofix
```

## Project Structure

- `src/pages/` — Route-level page components (Landing, Dashboard)
- `src/components/` — Shared and landing page components
- `src/components/dashboard/` — Dashboard-specific components (Sidebar, HubContent, AppView, CopilotModal, etc.)
- `src/components/ui/` — Reusable UI primitives (Modal, NavLink, Avatar, Badge)
- `src/hooks/` — Custom hooks (useGeminiAction, useApiData, useLocalStorage)
- `src/api/` — Mock API data fetchers

## Key Patterns

- Dashboard state (active app, modals) is managed in `src/pages/Dashboard.jsx` and passed down as callbacks.
- AI features use `useGeminiAction` hook which calls the Gemini API with a user-provided API key stored in localStorage.
- `AppView` is a placeholder shell — individual app modules mount inside it.
