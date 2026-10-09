# Locat UI — Liquid Titanium + Smoked Glass

A standalone **React 19 + TypeScript + Vite + Tailwind** implementation of the approved
Locat interface. Every screen is built from real, editable components — no static
images or screenshot stand-ins. The UI is backend-independent: all data flows through
a single typed seam, `LocatUiAdapter` (`src/adapter.ts`), with a clearly-marked mock
implementation (`src/mock/`) so the kit runs end-to-end without a server.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3002
```

Sign in with **any username and password** — the mock adapter mints a local demo
session. No credentials are hardcoded or required.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (port 3002) |
| `npm run check` | TypeScript project build (`tsc -b`) |
| `npm run lint` | ESLint (typescript-eslint + react-hooks) |
| `npm test` | Vitest suite (tokens, adapter contract, app smoke tests) |
| `npm run build` | Production build (tsc + vite) |

## Layout

```
src/
  adapter.ts            LocatUiAdapter — the integration contract
  types.ts              UserProfile / ConversationSummary / UiMessage / events
  index.css             Liquid Titanium design tokens (mirrors the main app 1:1)
  theme/tokens.ts       TS mirror of token values + accent/theme helpers
  components/           brand, ui primitives, Avatar, ChatList, ChatWindow,
                        MessageBubble, Drawer, PeopleDialog, ProfileDialog,
                        SettingsSheet, states (loading/empty/error/offline)
  screens/              AuthScreen, ChatsScreen, GalleryScreen
  mock/                 MOCK data + adapter (delete after integration)
docs/
  SCREEN_INVENTORY.md   every screen and state
  COMPONENT_MAP.md      reusable components and their props
  LOCAT_INTEGRATION.md  how to wire this UI into the real Locat app
  TEST_RESULTS.md       checks that were run and their results
```

## Design system

Dark titanium background (`#0A0B0D`), layered translucent glass surfaces
(`.smoked-glass`, `.titanium-panel`), brushed-metal CTAs (`.locat-metal-button`),
steel-blue accent (`.steel-button`, `.text-steel`, `.bg-steel`), titanium/glass
message bubbles (`.bubble-out` / `.bubble-in`), light theme + six accent variants
via `data-theme` / `data-accent` attributes. Tokens are identical to the main
Locat app's `src/index.css`.

## Status

UI-only deliverable. Transport, encryption, and persistence are intentionally
mocked behind `LocatUiAdapter`; see `docs/LOCAT_INTEGRATION.md` for the swap.
Known limitations are listed in `docs/TEST_RESULTS.md`.
