# ONXX Rebrand Agent Runbook

## Mission
Execute the ONXX rebrand from "Essential Fitness" to "ONXX" with three priorities:
1. Technical performance (SvelteKit + Tailwind v4 quality and stability).
2. Conversion (dark, bold, high-contrast visual direction).
3. SEO authority (brand-consistent metadata and discoverability).

## Success Criteria
1. Each phase in `gameplan.md` is implemented in order unless a blocker requires explicit reprioritization.
2. Brand identity is consistently ONXX across typography, colors, copy, and metadata.
3. Validation commands pass before phase completion is reported.

## Source Of Truth
1. Primary: `gameplan.md`
2. Operational checklist and reporting format: `agent.md`
3. Implementation files under `src/`, `static/`, and `content/`

## Execution Rules
1. Follow phase and step order from `gameplan.md`.
2. Complete each step with file-level verification before moving to the next.
3. Preserve SvelteKit and Tailwind v4 conventions.
4. Avoid introducing ad hoc style tokens outside the global system.
5. Log assumptions and any deviations in handoff notes.

## Phase Tracker (Mirrors `gameplan.md`)
| Phase | Step | Status | Files | Notes |
|---|---|---|---|---|
| 1 - The Design System | 1.1 Implement Typography | Not Started | `src/app.html` | No Montserrat/preconnect links currently present. |
| 1 - The Design System | 1.2 Configure Tailwind v4 Theme | Not Started | `src/routes/layout.css` | ONXX `@theme` tokens and base heading/body styles not implemented yet. |
| 2 - Layout and Core Branding | 2.1 Update Header and Navigation | Complete (local, untracked) | `src/routes/+layout.svelte` | ONXX logo text, nav style updates, and CTA are implemented in current local file. |
| 2 - Layout and Core Branding | 2.2 Update Footer | Complete (local, untracked) | `src/routes/+layout.svelte` | Footer reads "ONXX Coaching" and uses ONXX background token fallback. |
| 3 - Homepage Hero (Key Messaging) | 3.1 Hero Copy Update | Complete (local, ignored content path) | `content/pages/home.md` | Exact H1/subhead/CTA implemented via markdown-driven home page content. |
| 4 - Dad Ready Assessment Refactor | 4.1 CSS Search and Replace | Not Started | `src/routes/dad-ready-assessment/dra.css` | Legacy color tokens still need refactor to ONXX variables. |
| 4 - Dad Ready Assessment Refactor | 4.2 Typography and UI Cleanup | Not Started | `src/routes/dad-ready-assessment/dra.css` | Heading font and primary button style updates still pending. |
| 4 - Dad Ready Assessment Refactor | 4.3 Content Updates | Not Started | `src/routes/dad-ready-assessment/+page.svelte` | Copy pass to ONXX voice still pending. |
| 5 - SEO and Metadata | 5.1 Update Meta Tags | Not Started | `src/routes/+layout.svelte`, `src/app.html`, `src/routes/+page.svelte` | ONXX title/description template still pending. |
| 5 - SEO and Metadata | 5.2 Favicon Swap | Not Started | `static/favicon.svg` | ONXX icon swap still pending. |

## Work Performed
1. Build blocker fix completed for blog routes:
   1. Moved blog data loading to server-only route modules.
   2. `src/routes/blog/+page.ts` and `src/routes/blog/[slug]/+page.ts` now only export `csr = false`.
   3. Added server loaders in `src/routes/blog/+page.server.ts` and `src/routes/blog/[slug]/+page.server.ts`.
2. Phase 2 layout shell implementation completed locally:
   1. Added ONXX header, navigation styling, CTA, and branded footer in `src/routes/+layout.svelte`.
3. Phase 3 hero/content rewrite completed locally:
   1. Replaced homepage content in `content/pages/home.md` with ONXX messaging.
   2. Exact required hero copy and `START ASSESSMENT` CTA to `/dad-ready-assessment` are present.
4. Validation evidence from latest run:
   1. `npm run check` passed (warnings only in `src/routes/dad-ready-assessment/+page.svelte`).
   2. `npm run build` passed.

## Work Left To Complete
1. Implement Phase 1 (global typography and theme system):
   1. Add Montserrat and preconnect links in `src/app.html`.
   2. Add ONXX Tailwind v4 theme tokens and base global styles in `src/routes/layout.css`.
2. Persist local completed work into tracked source control state:
   1. Add and track `src/routes/+layout.svelte`.
   2. Add and track `src/routes/blog/+page.server.ts` and `src/routes/blog/[slug]/+page.server.ts`.
   3. Decide whether to keep `content/pages/home.md` tracked (currently in ignored path context).
3. Implement Phase 4 DRA refactor:
   1. Replace legacy hex colors with ONXX variables in `src/routes/dad-ready-assessment/dra.css`.
   2. Update typography and button styles in `src/routes/dad-ready-assessment/dra.css`.
   3. Update DRA copy in `src/routes/dad-ready-assessment/+page.svelte`.
4. Implement Phase 5 SEO and metadata:
   1. Update title/meta description strategy in `src/app.html`, `src/routes/+layout.svelte`, and `src/routes/+page.svelte`.
   2. Replace `static/favicon.svg` with ONXX icon.

## Execution Notes
1. `content/pages/home.md` has been updated locally, but `content/pages/` is currently ignored in git status output.
2. Several completed files are currently untracked (`src/routes/+layout.svelte`, `src/routes/blog/+page.server.ts`, `src/routes/blog/[slug]/+page.server.ts`).
3. Because the homepage is markdown-driven through `src/routes/+page.server.ts`, Phase 3 hero messaging was implemented in content rather than directly in `src/routes/+page.svelte`.

## Validation Commands
Run after meaningful updates and before phase completion:
1. `npm run check`
2. `npm run lint`
3. `npm run build`

## Handoff Format
Use this format at each checkpoint:
1. What changed: files and behavior updates.
2. Validation evidence: command outcomes and key observations.
3. Risks or follow-ups: known gaps, assumptions, and next step.
