# Infinite Pieces AI — Infinite Suite OS

Enterprise ABA (Applied Behavior Analysis) clinic management dashboard.

## Tech Stack

- React 18 + React Router v6
- Vite (dev/build)
- Tailwind CSS
- lucide-react (icons)
- Google Gemini API for AI features (copilot, briefings, surge forecasting)

## Project Structure

- `frontend/` — React SPA (all source, config, and dependencies)
- `terraform/` — AWS infrastructure (S3, CloudFront)
- `scripts/` — Shell helpers (env loading)
- `secrets/` — Local-only secret files (gitignored)

## Commands

All frontend commands run from the `frontend/` directory:

```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint check
npm run lint:fix   # ESLint autofix
```

## Architecture Rules

### State Management

- **Global state** lives in `frontend/src/context/AppContext.jsx` — use `useApp()` to access `apiKey`, `user`, `notifications`, and settings state from any component. Do not prop-drill these values.
- **Local state** (useState) is for UI-only concerns: which tab is active, is a modal open, form input values, loading spinners. If only one component cares about it, keep it local.
- When deciding where state belongs: if multiple components across the tree need it, it goes in context. If it's scoped to one component or one view, keep it inline.

### Component Organization

- **App modules** in `frontend/src/components/apps/` should be split into directories, not monolithic files. Follow the `bcba-pocket/` pattern:
  - `index.jsx` — app shell (sidebar, tab routing, top-level state)
  - `components/` — small reusable pieces specific to this app
  - `views/` — one file per tab/screen
  - Additional subdirectories as needed (e.g. `toolbox/`)
- Each component file should have a single default export.
- Inline sub-components are acceptable only if they are small (<30 lines) and used only once in the parent.

### Data Fetching

- **No hardcoded data in components.** Seed data, mock clients, config values, etc. go in `frontend/src/api/mock/appData.js` with a corresponding endpoint in `handlers.js` and fetcher function in `apps.js`.
- Components fetch data using `useApiData(fetcherFunction)` and render loading/fallback states.
- The mock API layer simulates real endpoints so switching to a real backend later only requires changing `client.js`.

### AI / Gemini Integration

- Use `callGemini(prompt, apiKey, systemText)` from `frontend/src/lib/gemini.js` for all AI calls. Do not write inline fetch calls to the Gemini API.
- For hooks that manage prompt → loading → result state, use `useGeminiAction` from `frontend/src/hooks/`.
- Exception: specialized API calls (Imagen image generation, TTS audio) that need different request shapes can use direct fetch, but should still read `apiKey` from context.

### Utilities

- **Pure functions** (no React) go in `frontend/src/lib/` — e.g. `copyToClipboard.js`, `renderMarkdown.jsx`.
- **Stateful logic** that can be reused goes in `frontend/src/hooks/` as custom hooks — e.g. `useToasts`, `useApiData`.
- Extract to a shared utility when the logic is used by 2+ components. Don't pre-extract for hypothetical reuse.

### Security

- Never use `dangerouslySetInnerHTML` with AI-generated content. Use `renderMarkdown()` from `frontend/src/lib/renderMarkdown.jsx` which returns safe React elements.
- `<style dangerouslySetInnerHTML>` for static CSS is acceptable.
- Do not hardcode API keys, PINs, or secrets in components. These should come from context, environment variables, or the mock API layer.

### Icons

- Use `lucide-react` for icons in app modules.
- The dashboard shell uses custom SVG icons from `frontend/src/components/Icons.jsx`.
