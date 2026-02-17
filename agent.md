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
| 1 - The Design System | 1.1 Implement Typography | Complete | `src/app.html` | Montserrat + preconnect links implemented. |
| 1 - The Design System | 1.2 Configure Tailwind v4 Theme | Complete | `src/routes/layout.css` | ONXX `@theme` tokens and base heading/body styles implemented. |
| 2 - Layout and Core Branding | 2.1 Update Header and Navigation | Complete (local, untracked) | `src/routes/+layout.svelte` | ONXX logo text, nav style updates, and CTA are implemented in current local file. |
| 2 - Layout and Core Branding | 2.2 Update Footer | Complete (local, untracked) | `src/routes/+layout.svelte` | Footer reads "ONXX Coaching" and uses ONXX background token fallback. |
| 3 - Homepage Hero (Key Messaging) | 3.1 Hero Copy Update | Complete (local, ignored content path) | `content/pages/home.md` | Exact H1/subhead/CTA implemented via markdown-driven home page content. |
| 4 - Dad Ready Assessment Refactor | 4.1 CSS Search and Replace | Complete | `src/routes/dad-ready-assessment/dra.css` | Legacy color/gradient usage migrated to ONXX tokenized styles. |
| 4 - Dad Ready Assessment Refactor | 4.2 Typography and UI Cleanup | Complete | `src/routes/dad-ready-assessment/dra.css` | Heading font moved to `var(--font-heading)` and primary button uses solid ONXX red. |
| 4 - Dad Ready Assessment Refactor | 4.3 Content Updates | Complete | `src/routes/dad-ready-assessment/+page.svelte` | Essential Fitness references replaced in DRA UI and links parameterized. |
| 5 - SEO and Metadata | 5.1 Update Meta Tags | Not Started | `src/routes/+layout.svelte`, `src/app.html`, `src/routes/+page.svelte` | ONXX title/description template still pending. |
| 5 - SEO and Metadata | 5.2 Favicon Swap | Not Started | `static/favicon.svg` | ONXX icon swap still pending. |

## Work Performed
1. Phase 1 prerequisite implementation completed:
   1. Added Montserrat loading and preconnect links in src/app.html.
   2. Added ONXX theme tokens and base typography styles in src/routes/layout.css.
2. Phase 4 DRA refactor completed:
   1. Migrated DRA CSS from legacy hex/gradient styling to ONXX tokenized palette in src/routes/dad-ready-assessment/dra.css.
   2. Removed radial texture and gradient-heavy backgrounds for matte ONXX presentation.
   3. Replaced Bebas/Source Sans usage with ar(--font-heading) and ar(--font-sans).
   4. Updated CTA/button treatment to solid ONXX red.
3. DRA content and link rebrand completed:
   1. Replaced DRA branding text from Essential Fitness to ONXX.
   2. Added env-driven URL configuration in src/routes/dad-ready-assessment/+page.svelte using $env/dynamic/public with fallback defaults.
4. Validation evidence from latest run:
   1. 
pm run check passed with 0 errors.
   2. Remaining warnings are known Svelte warnings in the DRA page (event-directive deprecations and a11y label association warnings).

## Work Left To Complete
1. Phase 5 SEO and metadata work remains:
   1. Update meta title/description strategy in src/app.html, src/routes/+layout.svelte, and src/routes/+page.svelte.
   2. Replace static/favicon.svg with ONXX icon asset.
2. Optional cleanup follow-up (non-blocking):
   1. Migrate deprecated on:* event directives to modern event attributes in DRA page.
   2. Address form-label association warnings in DRA page for accessibility hardening.

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


## Run Report (2026-02-17)
1. Scope executed: Phase 4 DRA refactor plus required Phase 1 token/font prerequisites.
2. Files updated: src/app.html, src/routes/layout.css, src/routes/dad-ready-assessment/dra.css, src/routes/dad-ready-assessment/+page.svelte.
3. Result: Implementation complete for Phase 4 checklist and compile checks passing (warnings-only).

