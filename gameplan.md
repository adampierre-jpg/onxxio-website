# ONXX Rebrand: Execution Master Plan

## 🎯 Objective
Transition the codebase from "Essential Fitness" to "ONXX" (Velocity-Based Kettlebell Training).
**Key Pillars:** Technical Performance (SvelteKit/Tailwind v4), Conversion (Dark/Bold UI), SEO (Authority).

---

## 🛠 Phase 1: The Design System (Global Config)
**Goal:** Establish the visual physics of the new brand (Colors & Typography) at the root level.

- [ ] **Step 1.1: Implement Typography**
    - **Target File:** `src/app.html`
    - **Action:**
        - Remove `Bebas Neue` and `Source Sans Pro`.
        - Add `Montserrat` (Weights: 400, 500, 600, 700, 800, 900) via Google Fonts or local host.
        - Ensure `<link rel="preconnect">` is present for performance.

- [ ] **Step 1.2: Configure Tailwind v4 Theme**
    - **Target File:** `src/routes/layout.css`
    - **Action:** Define CSS variables in the `@theme` block.
        - `--color-onxx-bg`: `#0F0F0F` (Main Background)
        - `--color-onxx-alt`: `#111111` (Card Background)
        - `--color-onxx-red`: `#E63946` (Primary Accent/CTA)
        - `--color-onxx-velocity`: `#FF9500` (Highlight)
        - `--color-onxx-text`: `#FFFFFF` (Primary Text)
        - `--color-onxx-muted`: `#A1A1A1` (Secondary Text)
        - `--font-sans`: `"Montserrat", system-ui, sans-serif`
    - **Action:** Apply base layer styles to `body` and `h1-h6` to enforce the "Dark, Moody" aesthetic globally.

---

## 🎨 Phase 2: Layout & Core Branding
**Goal:** Eradicate old branding from the structural shell of the site.

- [ ] **Step 2.1: Update Header & Navigation**
    - **Target File:** `src/routes/+layout.svelte`
    - **Action:**
        - Replace text/img "Essential Fitness" with the **ONXX** Logo (SVG recommended).
        - Ensure Logo max-height is ~80px for web.
        - Update navigation font classes to `font-bold uppercase tracking-wide`.

- [ ] **Step 2.2: Update Footer**
    - **Target File:** `src/routes/+layout.svelte`
    - **Action:**
        - Change copyright text to "ONXX Coaching".
        - Ensure footer background matches `--color-onxx-bg`.

---

## 🏠 Phase 3: Homepage Hero (Key Messaging)
**Goal:** Implement the new copy strategy immediately on the landing page.

- [ ] **Step 3.1: Hero Copy Update**
    - **Target File:** `src/routes/+page.svelte`
    - **Action:**
        - **H1:** "STRENGTH THAT SERVES YOU"
        - **Subhead:** "Velocity-Based. Kettlebell-Driven. The precision training system for men 35+ who need athletic resilience."
        - **CTA:** "START ASSESSMENT" (Links to `/dad-ready-assessment`)

---

## 🚀 Phase 4: "Dad Ready Assessment" Refactor
**Goal:** Transform the lead magnet from "generic gym" to "premium athletic tool".

- [ ] **Step 4.1: CSS Search & Replace**
    - **Target File:** `src/routes/dad-ready-assessment/dra.css`
    - **Action:** Refactor legacy hex codes to use new CSS variables.
        - Replace `#0a0a0a` → `var(--color-onxx-bg)`
        - Replace `#1a1a1a` / `#141414` → `var(--color-onxx-alt)`
        - Replace `#8B0000` / `#4A0000` → `var(--color-onxx-red)`
        - Remove background texture/gradients (`radial-gradient`) for a clean, flat matte finish.

- [ ] **Step 4.2: Typography & UI Cleanup**
    - **Target File:** `src/routes/dad-ready-assessment/dra.css`
    - **Action:**
        - Replace `font-family: 'Bebas Neue'` with `font-family: var(--font-heading); font-weight: 800`.
        - Update `.dra-btn-primary` to use solid `#E63946` background.

- [ ] **Step 4.3: Content Updates**
    - **Target File:** `src/routes/dad-ready-assessment/+page.svelte`
    - **Action:**
        - Scan text for "Essential Fitness" and replace with "ONXX".
        - Verify tone aligns with new messaging.

---

## 🔍 Phase 5: SEO & Metadata
**Goal:** Signal the rebrand to search engines.

- [ ] **Step 5.1: Update Meta Tags**
    - **Target Files:** `src/routes/+layout.svelte`, `src/app.html`, `src/routes/+page.svelte`
    - **Action:** Update `<title>` and `<meta name="description">`.
        - **Title Template:** `ONXX | Velocity-Based Kettlebell Training`
        - **Keywords:** Kettlebell, Velocity-Based Training, Dad Strength, Over 35 Fitness.

- [ ] **Step 5.2: Favicon Swap**
    - **Target Directory:** `static/`
    - **Action:** Replace `favicon.svg` with the new "Kettlebell with Red Slash" icon.
    