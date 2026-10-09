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

### 2026-10-09 — Stages 2–4: auth, inbox/drawer, conversation view
- Login/registration presentation restyled (titanium panel, metal CTA); auth flow untouched.
- Drawer + inbox restyled; compact privacy status card added.
- ChatWindow conversation interface restyled: `.bubble-out` (brushed titanium) outgoing bubbles, `.bubble-in` (smoked glass) incoming, glass actions menu, steel read receipts, steel online presence, rounded composer with steel send button, day-divider pills, reply bar.
- Steel accent tokens (`--steel`, `--steel-deep`, `.steel-button`, `.text-steel`, `.bg-steel`) added to `src/index.css` (dark + light).
- Verified by testing agent (`/app/test_reports/iteration_2.json`): all messaging functionality intact end-to-end with real MariaDB + two live accounts (alice_demo/bob_demo).

### 2026-10-09 — Brand mark replaced with exact approved artwork
- `LocatMark` renders the exact client-supplied metallic split-face cat (`public/locat-mark.png`); favicon/PWA icons regenerated (`icon-192.png`, `icon-512.png`).
- Capacitor native icon/splash sources generated in `/app/locat/assets/` with `docs/BRAND_ASSETS.md` (native projects are not in the branch; generation runs on the user's machine).

### 2026-10-09 — locat-ui standalone UI kit (GitHub deliverable)
- Created `/app/locat-ui/`: standalone React 19 + TS + Vite + Tailwind implementation of the approved design with real interactive components (no static images).
- Screens: auth (login/register), chats list, direct chat, group chat, profile/bio, people discovery + requests, group creation, settings sheet (profile/appearance/storage/about), drawer, design gallery; loading/empty/error/offline states.
- Integration contract: `src/adapter.ts` (`LocatUiAdapter`) + `src/types.ts`; mock adapter + data isolated in `src/mock/`; tokens mirrored 1:1 from the main app.
- Docs: `README.md`, `docs/SCREEN_INVENTORY.md`, `docs/COMPONENT_MAP.md`, `docs/LOCAT_INTEGRATION.md`, `docs/TEST_RESULTS.md`.
- Verification: tsc 0 errors, eslint 0 errors, Vitest 10/10, production build PASS; testing agent passed all 15 E2E items (`/app/test_reports/iteration_3.json`).
- Delivery: user pushes via Emergent "Save to GitHub" (no GitHub credentials in this environment).

### 2026-10-09 — Stages 5–6: settings dialogs + responsive validation
- Styled ProfileDialog (glass selects, ABOUT YOU/PRIVACY kickers, titanium header, styled checkbox), StorageDialog (titanium panels, steel-shield Privacy nav, encrypted-backup kicker), FriendProfileDialog (smoked glass, LC chip, titanium bio card), GroupDialog (glass member rows, styled transfer select), NewConversationDialog (glass tablist/rows/chips).
- Responsive fixes: sidebar inner container missing `w-full` (pre-existing in feat/locat-1.0) caused a dead strip on mobile inbox — fixed and verified 389px @ 390px viewport; friend-row LC code wrap fixed with truncate.
- Verified by testing agent (`/app/test_reports/iteration_4.json`): all 10 items pass, dialogs fully functional, zero new console errors.
- locat-ui kit: added `src/live/TrpcLocatAdapter.ts` — starter adapter pre-mapped to the app's real tRPC procedures (auth/users/conversations/messages) with `LiveCryptoHooks` TODO seams; integration doc updated.
- Native icons: `@capacitor/assets generate --android` pipeline verified working in a throwaway project with the prepared `assets/` sources (android/ native project is not in the branch; generation runs on the user's machine per docs/BRAND_ASSETS.md).

## Prioritized backlog

### P0
- None remaining for the redesign scope. All six stages complete.

### P1
- Validate keyboard, safe areas, focus order, contrast, reduced motion, and long content on narrow browser widths.
- Perform real Android Capacitor visual QA; do not claim emulator or APK validation from browser preview alone.

### P2
- Regenerate native launcher/splash assets on a machine with the android/ios projects (`npx capacitor-assets generate`, sources ready in `/app/locat/assets/`).
- Add optional account-level privacy dashboard only for capabilities that are actually implemented.
- Consider bundle splitting for the existing production chunk-size warning.

## Next tasks
1. User pushes the workspace (including `/app/locat-ui`) to `ibrahim1101/locat-ui` via "Save to GitHub".
2. Real Android Capacitor device QA after building the APK on the user's machine.
3. Optional: wire `TrpcLocatAdapter` crypto hooks when integrating the kit into the main app.