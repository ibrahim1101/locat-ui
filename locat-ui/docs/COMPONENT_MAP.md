# Locat UI — Component Map

All components are presentational and typed. None of them import from `src/mock/`
or perform network calls — data arrives via props, and every async action is a
handler prop so screens can stay wired to `LocatUiAdapter`.

## Brand & primitives

| Component | File | Key props | Notes |
| --- | --- | --- | --- |
| `LocatMark` | `components/brand.tsx` | `className` | Exact approved artwork (`/locat-mark.png`) |
| `LocatWordmark` | `components/brand.tsx` | `className` | "Locat" wordmark styling |
| `Button` | `components/ui.tsx` | `variant: metal \| control \| ghost \| destructive` | 44px min touch target |
| `IconButton` | `components/ui.tsx` | `active` | Circular ghost icon button, steel when active |
| `Input` / `Textarea` / `Field` | `components/ui.tsx` | standard + `label` | Glass inputs with ring focus |
| `Card` | `components/ui.tsx` | — | `titanium-panel` surface |
| `Segmented` | `components/ui.tsx` | `options, value, onChange` | Chats/Hidden, Light/Dark, tabs |
| `Dialog` | `components/ui.tsx` | `open, onClose, title, wide` | Centered modal, Escape + backdrop close |
| `Sheet` | `components/ui.tsx` | `open, onClose, title` | Bottom sheet on phones, centered panel ≥ sm |
| `Skeleton` | `components/ui.tsx` | — | Pulse placeholder |

## Chat

| Component | File | Key props | Notes |
| --- | --- | --- | --- |
| `ChatList` | `components/ChatList.tsx` | `conversations, activeId, meId, loading, error, onRetry, onSelect` | Tabs, search, rows; exports `conversationTitle` / `otherMember` helpers |
| `ChatWindow` | `components/ChatWindow.tsx` | `conversation, messages, me, onBack, onSendText, onSendImage, onSendFile, onSendVoice, onEdit, onDelete, onToggleHidden, onOpenProfile, onOpenGroup` | Header, search, canvas, reply bar, composer, security dialog |
| `MessageBubble` | `components/MessageBubble.tsx` | `message, showSender, canControl, onReply, onEdit, onDelete, onToggleHidden, onRetry` | Text/image/file/voice kinds, actions menu, read receipts |
| `DayDivider` | `components/MessageBubble.tsx` | `label` | Glass pill divider |

## People & profile

| Component | File | Key props | Notes |
| --- | --- | --- | --- |
| `PeopleDialog` | `components/PeopleDialog.tsx` | `friends, requests, onSearchPeople, onSendRequest, onAccept, onDecline, onRemove, onMessage, onCreateGroup` | 4 tabs; debounced search |
| `ProfileDialog` | `components/ProfileDialog.tsx` | `user, onClose, onMessage` | Bio card |
| `GroupDialog` | `components/ProfileDialog.tsx` | `conversation, meId, onClose, onOpenProfile` | Member list |

## Shell & states

| Component | File | Key props | Notes |
| --- | --- | --- | --- |
| `Drawer` | `components/Drawer.tsx` | `open, onClose, me, theme, accent, onThemeChange, onAccentChange, onOpenPeople, onOpenSettings, onOpenGallery, onSignOut` | Smoked-glass nav overlay |
| `SettingsSheet` | `components/SettingsSheet.tsx` | `me, theme, accent, …, onSaveProfile, onOpenGallery` | Profile / appearance / storage / about |
| `Spinner`, `ChatListSkeleton`, `MessageSkeleton` | `components/states.tsx` | — | Loading |
| `EmptyState` | `components/states.tsx` | `icon, title, hint, action` | Empty surfaces |
| `ErrorState` | `components/states.tsx` | `title, error, onRetry` | Retryable errors |
| `OfflineBanner` | `components/states.tsx` | `visible` | Top strip |
| `PrivacyCard` | `components/states.tsx` | — | Encryption assurance card |
| `Avatar` / `AvatarStack` | `components/Avatar.tsx` | `user, size, showPresence` | Hue identicons, steel online dot |

## Contracts

- `src/types.ts` — `UserProfile`, `ConversationSummary`, `UiMessage`, `AdapterEvent`.
- `src/adapter.ts` — `LocatUiAdapter` (auth, conversations, messages, people, profile, realtime).
- `src/theme/tokens.ts` — TS mirror of the CSS tokens; `applyAppearance(theme, accent)`.
