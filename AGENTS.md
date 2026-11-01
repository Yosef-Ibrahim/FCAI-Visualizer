# AGENTS.md — FCAI-Visualizer (AlgoVs)

Educational algorithm & data-structure visualizer built for FCAI-CU students.
React 19 + Vite 8, plain JavaScript/JSX (**no TypeScript**), Canvas 2D rendering,
deployed to Vercel. Algorithm logic is deliberately decoupled from React.

## Commands

Node 24.x is pinned (`.node-version`, `engines: 24.x`).

### Choosing a Node setup (developers and AI agents)

- If Node 24.x is already available, use ordinary `npm` commands. The portable
  setup is optional.
- If a developer prefers not to install or upgrade Node globally, Windows
  x64/ARM64 users can use the shared **portable, project-local Node** tooling:
  run `powershell -ExecutionPolicy Bypass -File .\scripts\setup-node.ps1` once,
  then use `.\npm.cmd <args>` (for example, `.\npm.cmd install`). The launcher
  selects the local runtime for npm and child scripts without changing the
  system installation or persistent PATH.
- AI agents: respect the developer's chosen setup. When they request a local
  runtime on Windows, use this tooling rather than installing Node globally.
  If `.tools/` already contains the pinned runtime, use `.\npm.cmd` directly.
- `.node-version`, `scripts/setup-node.ps1`, and `npm.cmd` are shared tooling;
  keep them in Git. Downloaded `.tools/` contents and `node_modules/` stay ignored.
  Rerun setup when the pinned version changes. This installer is Windows-only;
  on macOS/Linux use an existing Node 24.x or a user-local version manager.

The commands below use the optional Windows launcher; replace `.\npm.cmd` with
`npm` when using your own Node 24.x installation.

```powershell
.\npm.cmd run dev        # Vite dev server
.\npm.cmd run lint       # ESLint (flat config) — must pass before finishing work
.\npm.cmd run typecheck  # tsc, scoped to the i18n layer
.\npm.cmd run i18n:check # locale bundles stay in sync with `en`
.\npm.cmd run test       # Vitest — the pure logic layers
.\npm.cmd run test:watch # Vitest in watch mode while you work
.\npm.cmd run build      # production build (Vercel deploys with this)
.\npm.cmd run preview    # serve the dist/ build
```

- **Tests live next to the code they cover** (`<name>.test.js`) and run under
  Vitest (`vitest.config.js`, Node environment, no globals — import
  `{ describe, it, expect }` from `'vitest'`). They cover the pure layers
  (`domain`, `application`, `algorithms` engines); React components and the
  canvas visualizers are out of scope. A loop over `AlgorithmRegistry` checks
  the Step contract for every registered algorithm, so a new algorithm is
  covered as soon as it is registered.
- `npm run verify` runs lint + typecheck + i18n:check + test + build in one
  pass and mirrors CI (`.github/workflows/ci.yml`).
- CI runs on every push to `main` and every pull request: install → lint →
  typecheck → i18n:check → test → build, on the Node version from
  `.node-version`. Deployment stays with Vercel's Git integration — the
  workflow only checks the code, it never deploys.
- Do not hand-edit `dist/` (build output) or `package-lock.json`.

## Commit messages

Follow Conventional Commits: `type(scope): subject`.

- Types and when to use each: `feat` (new feature), `fix` (bug fix),
  `refactor` (no behavior change), `chore` (tooling/deps/cleanup),
  `docs` (documentation), `style` (formatting/whitespace only), `perf`,
  `test`, `ci`.
- Scope is optional and names the area: `fix(sidebar): ...`,
  `chore(trees): ...`.
- Subject: imperative mood ("add", not "added/adding"), ≤ 72 characters,
  no trailing period.
- Body (blank line after subject): explain WHY when non-obvious; use
  bullets for multi-part changes.
- One logical change per commit — don't mix unrelated refactors into a
  feature commit.
- NEVER add `Co-Authored-By`, "Generated with ..." or any AI attribution
  footers.

Always follow these commit rules — they bind all contributors and AI agents
working in this repo.

## Architecture (layered — keep it)

```
src/
  domain/          Pure model layer. No React, no DOM import.
    algorithms/    Algorithm base class, AlgorithmMetadata, Step (playback unit)
    quiz/          Question entity
  application/     Use cases + strategies + registry
    AlgorithmRegistry.js     ← single source of truth for algorithm discovery
    algorithms/<category>/   Step-generating strategy classes; category base
                             classes: SortingAlgorithm, SearchingAlgorithm,
                             TreeAlgorithm, GraphAlgorithm, DataStructureAlgorithm
                             (all extend domain Algorithm)
  algorithms/      Pure-JS engines + imperative canvas visualizers (older layer,
                   still in use): TreeBase + BST/AVLTree/RedBlackTree nodes,
                   DS engines (ArrayDS/QueueDS/StackS/LinkedListDS),
                   treeVisualizer.js, dsVisualizer.js, sorting/searching/graph
                   visualizers, sortingGenerators.js
  infrastructure/  Adapters only: storage (localStorage), canvas renderers
  i18n/            Locale layer (en, ar, ja, zh): locales mirror data/dynamic UI
  pages/           React "playback controllers" (state: steps + stepIdx)
  components/      layout/ (Layout, Sidebar, Header), ai/, sorting/, shared/
  hooks/           useLang (persisted code language), useProgress (quiz state)
  audio/           audioEngine singleton — Web Audio stub, NOT wired to UI yet
  data/            algorithmData.js (complexity, names, explanations, code
                   snippets), courses.js
  styles/          CSS-variable design system; one CSS file per page area
  *.test.js        Vitest suites, colocated with the code they cover
Red_Black_Tree/    C++ course reference implementation (do not modify)
```

**Key rule:** new algorithm logic goes in the pure layers
(`domain` / `application` / `algorithms` engines). Pages only orchestrate
playback (generate steps → step forward/back → draw). Never put algorithm
logic inside components.

**i18n rule:** UI chrome uses `useT`; algorithms emit data-only
`msgKey`/`msgParams` next to legacy `msg` and consume `stepText()` for display.
Plural strings use the i18next suffix form (`key_one` / `key_other`) — the
nested object form (`{ one, other }`) does not resolve to a string in i18next
v26. See `docs/i18n.md`.

## The Step contract

`generateSteps()` returns an array of `Step` objects
(`src/domain/algorithms/Step.js`):
`{ arr, compare, swap, sorted, current, found, msg, codeLine, codeLines }`.

- `codeLine` is a single legacy line index; prefer `codeLines` keyed by
  language (`'js' | 'python' | 'cpp' | 'java' | 'csharp'` — see `useLang`).
- When adding/editing `codeSnippets` in `src/data/algorithmData.js`, line
  numbers stored in steps must stay aligned (snippets are stored as line
  arrays and joined by pages).
- Every step should carry a human-readable `msg` — it drives narration and
  screen readers. Translated builds read `msgKey`/`msgParams` instead
  (`stepText()` prefers `msgKey`), so a step needs at least one of the two;
  the Step-contract test in `src/application/AlgorithmRegistry.test.js`
  enforces that.

## Adding an algorithm (registry pattern)

1. Create a class in `src/application/algorithms/<category>/` extending the
   category base class; implement `generateSteps()` and (if needed)
   `getDefaultInput()`.
2. Export it from the category's `index.js`.
3. Register it in the array at `src/application/AlgorithmRegistry.js`
   (fourth/fifth step matters — it is the only place pages look up algorithms).
4. Add metadata to `src/data/algorithmData.js`: `complexity`, `explanations`,
   `algoNames`, `codeSnippets` (multi-language, per language arrays of lines).
5. Add URL slug handling: route in `src/App.jsx`, title label in
   `src/components/layout/Header.jsx` (`ROUTE_TITLE_KEYS` plus the
   `ALGORITHM_SLUGS` / `TOPIC_SLUGS` / `DS_TYPE_KEYS` sets), sidebar nav
   in `src/components/layout/Sidebar.jsx`. Some pages additionally filter by
   id lists (e.g. `SORTING_KEYS` in `src/pages/Sorting.jsx`).
6. Deep-link conventions: list route + `/<category>/<algo-slug>` route both
   render the same page (sync state from `useParams`). A course page
   (`/courses/...`) wraps the same component and needs its own
   `/courses/.../<algo-slug>` route — keep the algorithm switch inside the
   current route so the sidebar highlight survives.

## Testing conventions

- Suites live next to the code they cover (`<name>.test.js`) and run under
  Vitest in Node (`vitest.config.js`). Import `{ describe, it, expect }`
  from `'vitest'` — no globals.
- Test the pure layers (`domain`, `application`, `algorithms` engines), not
  React components or canvas drawing. A loop over `AlgorithmRegistry` checks
  the Step contract for every registered algorithm, so a new algorithm is
  covered as soon as it is registered — add cases there instead of a new
  file.
- Assert behaviour, not wording: check that `msg`/`msgKey` exist, never the
  exact sentence.
- A known limitation is tracked with `it.fails(...)` — the suite stays green
  and the day someone fixes it, the test asks to be updated.

## Canvas visualizer conventions

Visualizers (`treeVisualizer.js`, `dsVisualizer.js`, graph/sorting/searching
visualizers) build their DOM **imperatively** inside container. Follow the
existing pattern exactly:

- Scoped CSS class prefix per visualizer (`tree-*`, `ds-*`, …) with its CSS
  file in `src/styles/` imported by the page wrapper.
- Unique element ids per page (`tv-*`, `ds-*`, …) — they must not collide
  with other visualizers.
- Multiply by `devicePixelRatio` in `resizeCanvas()`; observe with
  `ResizeObserver`; support zoom/pan camera (`resetCamera()`).
- Must return `{ ..., destroy, resetCamera }`: cancel `requestAnimationFrame`,
  disconnect observers, remove window listeners, clear container. Pages call
  `destroy()` in their `useEffect` cleanup (see
  `src/components/shared/TreeVisualizerPage.jsx`) — never skip this, or
  double-mounts leak rAF loops.
- Theme: pages set `<html data-theme="light|dark">`
  (`Layout.jsx`, persisted as `fcai_visualizer_theme`). Canvas code cannot use
  CSS variables, so each visualizer defines its own `THEMES` map and picks by
  reading `data-theme`. Note the inconsistent key names (`night` in some
  files, `dark` in others; `THEMES.dark = THEMES.night` exists as alias) —
  match whichever the file you are editing uses.
- Accessibility: `role="img"` + `aria-label` on canvases, `aria-live="polite"`
  region for step narration. Keep these in new visualizers.

## Persistence & state

- All `localStorage` keys are prefixed `fcai_visualizer_`
  (`_lang`, `_theme`, `_training_progress`).
  Wrap reads/writes in try/catch — Safari/private mode can block localStorage.

## AI features & secrets

- AI question generation and user AI-key management were removed (Phase 0);
  the app is fully offline for questions/plans (built-in question banks).
- No `VITE_*` build-time env vars are currently required (`.env.example`).
- **Never commit real API keys.** If secrets are ever needed again, they
  belong in server-side stores such as Vercel env vars, never in source.
- `vercel.json` rewrites everything except `/api/*` to `index.html` (SPA).

## Style & code conventions

- ES modules (`"type": "module"`). Import style is mixed: extension-less in
  React code, with explicit `.js` inside some engine files — match the file
  you are editing.
- ESLint flat config (`eslint.config.js`) extends `react-hooks` +
  `react-refresh/vite`; run `npm run lint`.
- UI icons come from `lucide-react`. Styling is primarily the custom
  CSS-variable system in `src/styles/` (one CSS file per page, imported by
  the page) — Tailwind v4 is configured via the Vite plugin but existing
  pages don't rely on it.
- React 19 + React Router v7 (imported from `react-router-dom`).
- Clickable cards and list items must be real `<button>` elements (or carry
  `role` + `tabIndex` and handle Enter/Space) — never `<div onClick>`. A
  control that is not usable yet stays focusable through `aria-disabled`
  rather than the `disabled` attribute.
- Step-generation and engine code should be framework-free pure JS

## One-off reference

- `Red_Black_Tree/` (C++) is course reference material — the JS
  `src/algorithms/trees/RedBlackTree.js` mirrors it; keep semantics in sync
  if you change either.
- `npm.cmd` and `scripts/setup-node.ps1` are maintained optional portable-Node
  tooling; keep their behavior aligned with `.node-version`.


## Input validation and tree invariants

- Tree node values are finite numbers in the supported range; parse with
  `Number`, never `parseInt`, so decimal values are preserved. An empty
  input is invalid and must never silently become node value `0`. An explicit
  `0` remains a valid value.
- Array insertion accepts only integer indexes in the inclusive range
  `0..length`. A blank index means append; a supplied negative, fractional,
  or greater-than-length index must be rejected, never clamped to append.
  Array value inputs must be non-empty; the string `"0"` is a valid value.
- Clear a successfully submitted tree/array value input after the operation
  is accepted. Enter and the visible Insert button must use the same handler.
- AVL height convention is: empty subtree = -1, leaf = 0. Keep
  `AVLNode.height`, `AVLTree._height`, and `_updateHeight` consistent.
  Balanced insertions must not emit rotations; test LL, RR, LR, and RL cases.
- Tree relationship lines must use the theme's `edgeCol`, not the node
  outline color. Preserve sufficient contrast in both light and dark themes.
- Before changing these behaviours, add/update colocated Vitest regression
  tests. Run `npm run verify` (lint, typecheck, i18n, tests, production build)
  and confirm the GitHub Actions CI workflow is green before reporting success.


## Data-structure code walkthrough languages and responsive UI

- Every operation in ArrayDS, LinkedListDS, StackDS, and QueueDS must expose
  JavaScript, Python, and C++ snippets to the imperative code walkthrough.
- C++ examples must be idiomatic educational snippets, include required
  standard headers, and match the operation being traced. Never fall back to
  JavaScript or Python text under a selected C++ tab.
- Keep language controls keyboard accessible and synchronize their pressed
  state with the selected language.
- Responsive visualizers must keep controls scrollable, canvas usable on
  narrow screens, and code panels within the canvas bounds. Avoid horizontal
  page overflow. Use ResizeObserver for canvas layout changes, reset the
  canvas transform on resize, and disconnect observers/listeners in destroy().
- Run npm run verify and inspect desktop, tablet, and mobile layouts before
  claiming responsive behaviour is verified.
