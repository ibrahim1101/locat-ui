# Locat UI — Screen Inventory

Every screen is a real component tree with functioning navigation, inputs,
buttons, menus and dialogs. Mock data lives only in `src/mock/`.

## Screens

| # | Screen | File | Route (kit shell) | Contents |
|---|--------|------|-------------------|----------|
| 1 | Sign in | `src/screens/AuthScreen.tsx` (mode `login`) | `auth` | Brand lockup, username + password, show/hide password, error line, pending state |
| 2 | Registration | `src/screens/AuthScreen.tsx` (mode `register`) | `auth` | + display name, password rules, confirm password, client validation |
| 3 | Chats / inbox | `src/screens/ChatsScreen.tsx` + `src/components/ChatList.tsx` | `chats` | Chats/Hidden segmented tabs, search, conversation rows (presence dot, unread badge, preview, timestamp), status footer |
| 4 | Direct conversation | `src/components/ChatWindow.tsx` | `chats` (selected) | Glass header (avatar, online state, search, security), day dividers, bubbles, reply bar, composer |
| 5 | Group conversation | same component, `type: "group"` | `chats` (selected) | Avatar stack, sender names, member count, group details entry |
| 6 | Navigation drawer | `src/components/Drawer.tsx` | overlay | Brand, nav items, privacy card, profile row, Light/Dark, accent picker, sign out |
| 7 | People & requests | `src/components/PeopleDialog.tsx` | dialog | Friends / People / Requests / Group tabs; search, add, accept, decline, remove, create group |
| 8 | User profile | `src/components/ProfileDialog.tsx` | dialog | Avatar, bio, LC code, presence, message action |
| 9 | Group details | `src/components/ProfileDialog.tsx` → `GroupDialog` | dialog | Member list with presence, profile drill-down |
| 10 | Encryption details | inside `ChatWindow.tsx` | dialog | E2E summary + session fingerprint surface |
| 11 | Settings | `src/components/SettingsSheet.tsx` | bottom sheet | Profile edit, appearance (theme + accent), storage & backups, about |
| 12 | Design gallery | `src/screens/GalleryScreen.tsx` | `gallery` | Every token, primitive, state and overlay for design review |

## States (all reachable in the running app)

| State | Where |
| --- | --- |
| Loading | `ChatListSkeleton`, `MessageSkeleton`, `Spinner` (list + conversation load) |
| Empty | No conversations, no search matches, empty conversation, no friends/requests |
| Error | Conversation list failure with retry (`ErrorState`); auth errors inline |
| Offline | `OfflineBanner` reacts to browser online/offline events |
| Pending / failed | Optimistic outgoing bubbles (`Sending…`, retry on failure) |
| Hidden | Per-message hide/restore; Hidden chats tab; hidden-message viewer |

## Responsive behavior

- `< md` (phones): single pane — list ⇄ conversation with a back button; drawer
  and sheets are full-height overlays with safe-area padding (`pt-safe`/`pb-safe`).
- `≥ md`: persistent sidebar + conversation split view.
- Composer sits above the Android keyboard via
  `viewport … interactive-widget=resizes-content` + `100dvh` (`app-height`).
- Inputs render at 16px below `md` to prevent iOS zoom (mirrored from main app).
