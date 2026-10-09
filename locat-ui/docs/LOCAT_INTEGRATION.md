# Integrating Locat UI into the existing Locat app

This kit is UI-only by design. Integration = keep the components and tokens,
replace the mock adapter, and mount the screens in your router. Your backend,
encryption, database, and authentication are **not** replaced or modified.

## 1. Design tokens (copy-paste)

- `src/index.css` mirrors the main app's tokens 1:1 (titanium palette, steel
  accents, `.smoked-glass`, `.titanium-panel`, `.bubble-out/.bubble-in`,
  `.steel-button`, `.locat-metal-button`, light theme + accent variants).
  If you integrate into the main Locat repo, the files are already identical —
  only the small "kit additions" section (animations) at the bottom is new.
- `tailwind.config.js` matches the main app's color/radius mapping.
- `src/theme/tokens.ts` is the programmatic mirror (same values).

## 2. Replace the mock adapter

Implement `LocatUiAdapter` (`src/adapter.ts`) over your tRPC client and local
encrypted store, then mount `<App adapter={yourAdapter} />` or wire the screens
directly. Suggested mapping:

| Adapter method | Real Locat equivalent |
| --- | --- |
| `signIn` / `register` / `signOut` | Existing auth mutations + key unlock/derivation |
| `listConversations` | Conversation summaries from the local store / relay sync |
| `listMessages` | Decrypted local history (IndexedDB) for the conversation |
| `sendText` / `sendImage` / `sendFile` / `sendVoice` | Existing encrypt-then-send pipeline (payload builders) |
| `editMessage` / `deleteMessage` / `toggleMessageHidden` | Existing edit / local-delete / hide-on-device mutations |
| `markRead` | Existing read-receipt send |
| `searchPeople` / `listFriends` / `listRequests` | Contact directory + relationship queries |
| `sendRequest` / `acceptRequest` / `declineRequest` / `removeFriend` | Contact request mutations + key exchange on accept |
| `openDirect` / `createGroup` | Conversation creation (incl. group-key distribution) |
| `updateProfile` | Profile mutation |
| `onEvent` | Your realtime/relay subscription mapped to `AdapterEvent` |

Message payloads in the real app are richer (encrypted envelopes); map them onto
`UiMessage` at the adapter boundary so components stay unchanged.

## 3. Routing

The kit shell (`src/App.tsx`) uses minimal state routing (`auth` / `chats` /
`gallery`) purely to demo the screens standalone. Mount `AuthScreen`,
`ChatsScreen`, and (optionally) `GalleryScreen` under your real router
(`react-router` in the main app). `ChatsScreen` manages its own drawer,
dialogs, and active-conversation state.

## 4. Android / Capacitor notes

- `index.html` sets `viewport-fit=cover` + `interactive-widget=resizes-content`
  so the composer tracks the virtual keyboard; the main app already does this.
- Screens pad with `pt-safe` / `pb-safe` utilities (defined in `index.css`).
  On native, keep the main app's `.locat-native` overrides.
- Inputs below `md` render at 16px to prevent iOS focus zoom.
- Brand assets: `public/locat-mark.png` (exact artwork) plus
  `icon-192.png` / `icon-512.png`. Native launcher icons/splash regenerate from
  the main repo's `assets/` folder (see `docs/BRAND_ASSETS.md` there).

## 5. What to delete after integration

- `src/mock/` (data + adapter) — development fixture only.
- `src/screens/GalleryScreen.tsx` and its drawer/settings entry points, unless
  you want to keep it as an internal design reference.
- The `MOCK` note under the auth screen (`AuthScreen.tsx` bottom line).

## 6. Checklist

- [ ] Adapter implemented and injected (`<App adapter={…} />`)
- [ ] Screens mounted in the real router
- [ ] `src/mock/` removed; no mock imports remain (grep for `mock/`)
- [ ] Auth screen wired to real sign-in/register mutations
- [ ] `npm run check && npm run lint && npm test && npm run build` pass
