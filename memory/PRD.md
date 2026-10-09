# Locat UI Redesign PRD

## Problem statement
Redesign the existing Locat self-hosted, end-to-end encrypted messaging application with a mobile-first Liquid Titanium + Smoked Glass visual system while preserving authentication, encryption, local history, relay delivery, attachments, settings, browser support, and Capacitor Android compatibility. Work is isolated on `feat/emergent-ui`, based on `feat/locat-1.0`.

## Architecture
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Radix UI, React Router, Capacitor 8.
- Backend: Node.js, Hono, tRPC, Drizzle ORM, MariaDB.
- Client security/data: browser crypto APIs, IndexedDB local history and durable outbox, encrypted relay envelopes.
- Validation: TypeScript build, ESLint, Vitest, Vite production build, browser/mobile viewport smoke checks, CI and Android workflow follow-up.

## User personas
- Privacy-conscious individuals using a self-hosted messenger with local message history.
- Small groups sharing encrypted direct and group conversations across browser and Android.
- Self-hosting operators maintaining Locat on a Raspberry Pi or Docker/Linux host.

## Core requirements (static)
- Keep the product name exactly `Locat` and preserve the cat-inspired metallic brand direction.
- Use the approved palette: `#0A0B0D`, `#111317`, `#17191D`, `#202329`, `#343840`, `#F1F3F5`, `#9DA4AF`, `#D3D8DF`.
- Maintain usable 44px+ touch targets, safe-area handling, keyboard-friendly inputs, visible focus states, reduced-motion support, and responsive narrow screens.
- Do not alter authentication, key derivation, encryption protocols, message delivery, local storage, database contracts, or backend behavior for visual-only work.
- Do not advertise Recovery Key or Link Device as completed user-facing functionality.

## Implemented

### 2026-10-09 — Repository audit and Stage 1 shared foundation
- Cloned `feat/locat-1.0` into `/app/locat` and created isolated local branch `feat/emergent-ui`.
- Audited README, handoff/design docs, authentication, chat shell, brand, appearance system, shared UI primitives, and core chat components.
- Confirmed baseline: TypeScript, lint, tests, and production build passed; lint has 11 existing non-failing Fast Refresh warnings; database integration tests are skipped without `TEST_DATABASE_URL`.
- Added exact Liquid Titanium palette tokens, smoked-glass surface treatment, shared control/surface utilities, touch-safe Button/Input/Card defaults, and the matching browser theme color.
- Added design-token regression tests for palette, safe-area, reduced-motion, touch sizing, and glass safeguards.
- No auth, crypto, relay, local database, messaging, or backend files were changed.
- Mobile smoke test passed at 390×844: the real login screen rendered without horizontal overflow; submit target measured 48px.

## Prioritized backlog

### P0
- Apply the shared foundation to authentication and key-restore surfaces without changing auth behavior.
- Refine responsive drawer/inbox navigation while preserving one canonical conversation list and existing state.
- Refine conversation header, message bubbles, composer, attachment controls, delivery states, and scrolling.
- Keep CI, TypeScript, lint, tests, build, and Android workflow green after each stage.

### P1
- Apply the system to profile, privacy, appearance, storage, group, and security dialogs.
- Validate keyboard, safe areas, focus order, contrast, reduced motion, and long content on narrow browser widths.
- Perform real Android Capacitor visual QA; do not claim emulator or APK validation from browser preview alone.

### P2
- Replace or refine native launcher/splash/PWA assets after visual review and asset clearance.
- Add optional account-level privacy dashboard only for capabilities that are actually implemented.
- Consider bundle splitting for the existing production chunk-size warning.

## Next tasks
1. Stage 2: redesign Login and key-restore presentation using the shared tokens, with one primary action and preserved username/password flow.
2. Stage 3: polish drawer and inbox responsive states.
3. Stage 4: polish conversation view and composer.
4. Stage 5: style existing dialogs/settings.
5. Stage 6: cross-browser and Android-oriented validation, then document results.