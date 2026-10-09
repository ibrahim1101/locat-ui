# Locat UI — Test Results

Run on the delivered source tree (`feat/emergent-ui` workspace export), Node 22, Chromium (Playwright).

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npm run check` (`tsc -b`) | **PASS** — 0 errors |
| ESLint | `npm run lint` | **PASS** — 0 errors, 3 warnings (`react-refresh/only-export-components` on files exporting helpers alongside components; non-blocking, same pattern as the main app) |
| Unit/integration | `npm test` (Vitest) | **PASS** — 10/10 tests across 3 files |
| Production build | `npm run build` | **PASS** — `dist/` emitted (JS ≈ 88 kB gzip, CSS ≈ 6.8 kB gzip) |

### Vitest suites

- `src/tokens.test.ts` (3 tests) — Liquid Titanium tokens, signature surfaces,
  light theme + accent variants present in `src/index.css`.
- `src/mock/adapter.test.ts` (4 tests) — adapter contract: sign-in + seeded
  conversations; send + read receipt + bot reply event; edit/hide/delete;
  request accept + group creation.
- `src/screens/app.test.tsx` (3 tests) — auth screen renders real controls;
  sign-in reaches the conversation list; opening a conversation and sending
  through the composer renders the new bubble.

## Manual verification (Playwright, dev server)

| Flow | 1280×800 | 390×844 |
| --- | --- | --- |
| Auth (sign in, validation errors, pending state) | ✅ | ✅ |
| Conversation list (tabs, search, unread badges, presence) | ✅ | ✅ |
| Direct chat (bubbles, day dividers, read receipts, image message) | ✅ | ✅ |
| Send text → optimistic bubble → confirmed → mock reply | ✅ | ✅ |
| Group chat (sender names, member count) | ✅ | ✅ |
| Group details dialog | ✅ | ✅ |
| Drawer (nav, privacy card, appearance, accent picker, sign out) | ✅ | ✅ |
| People dialog (Friends/People/Requests/Group) | ✅ | ✅ |
| Settings sheet (profile edit + save confirmation) | ✅ | ✅ |
| Design gallery | ✅ | ✅ |
| Mobile back navigation (list ⇄ chat) | n/a | ✅ |
| No horizontal overflow / composer above keyboard area | ✅ | ✅ |

## Secrets & credentials

- No production secrets, API keys, or credentials anywhere in the tree.
- The mock adapter accepts any non-empty username/password and stores state in
  memory only. `src/mock/` is marked for deletion post-integration.

## Known limitations (intentional in the UI kit)

1. Voice messages render the waveform UI with simulated playback progress; the
   mock adapter ships no audio bytes. Real audio arrives with integration.
2. Message edit/delete use `window.prompt`/`window.confirm`, matching the main
   app's current UX; swap for styled dialogs if desired.
3. Image messages sent from the composer use `URL.createObjectURL` previews;
   they live only for the session (no persistence in the mock).
4. The shell router (`App.tsx`) is a minimal state router for standalone demo;
   mount the screens in the app's real router during integration.
5. Gallery screen is a design-review surface, not a product screen.
