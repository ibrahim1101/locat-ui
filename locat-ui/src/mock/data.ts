/**
 * ============================================================================
 * MOCK DATA — development fixture only. Not used in production integration.
 * Everything in this file is invented sample content so the UI can run
 * standalone. No real credentials, keys, or user data exist here.
 * ============================================================================
 */
import type { ConversationSummary, UiMessage, UserProfile } from "../types";

const now = Date.now();
const min = 60_000;
const hour = 60 * min;

export const MOCK_CONTACTS: UserProfile[] = [
  { id: "u-ava", username: "ava", displayName: "Ava Sterling", bio: "Design systems and quiet interfaces.", lcCode: "LC-2214", avatarHue: 210, online: true },
  { id: "u-noah", username: "noah", displayName: "Noah Reyes", bio: "Rust, relays, and long rides.", lcCode: "LC-9310", avatarHue: 152, online: false },
  { id: "u-mira", username: "mira", displayName: "Mira Chen", bio: "Cryptography researcher. Signal over noise.", lcCode: "LC-4477", avatarHue: 268, online: true },
  { id: "u-elias", username: "elias", displayName: "Elias Ford", bio: "Self-host everything.", lcCode: "LC-8032", avatarHue: 24, online: false },
];

/** People discoverable through search but not yet contacts. */
export const MOCK_STRANGERS: UserProfile[] = [
  { id: "u-sana", username: "sana", displayName: "Sana Iqbal", bio: "Mobile engineering, Karachi.", lcCode: "LC-5120", avatarHue: 330, online: true },
  { id: "u-theo", username: "theo", displayName: "Theo Marchetti", bio: "Photography and espresso.", lcCode: "LC-6642", avatarHue: 36, online: false },
];

/** Incoming contact requests waiting in the Requests tab. */
export const MOCK_REQUESTS: UserProfile[] = [
  { id: "u-sana", username: "sana", displayName: "Sana Iqbal", bio: "Mobile engineering, Karachi.", lcCode: "LC-5120", avatarHue: 330, online: true },
];

export function mockConversations(me: UserProfile): ConversationSummary[] {
  const [ava, noah, mira, elias] = MOCK_CONTACTS;
  return [
    {
      id: "c-ava",
      type: "direct",
      members: [me, ava],
      lastMessagePreview: "The glass header feels right at last.",
      lastActivityAt: now - 4 * min,
      unreadCount: 1,
      hiddenCount: 0,
    },
    {
      id: "c-titanium",
      type: "group",
      name: "Titanium Circle",
      members: [me, ava, noah, mira, elias],
      lastMessagePreview: "Mira: key rotation landed cleanly.",
      lastActivityAt: now - 42 * min,
      unreadCount: 3,
      hiddenCount: 0,
    },
    {
      id: "c-noah",
      type: "direct",
      members: [me, noah],
      lastMessagePreview: "Voice message · 0:42",
      lastActivityAt: now - 5 * hour,
      unreadCount: 0,
      hiddenCount: 2,
    },
    {
      id: "c-mira",
      type: "direct",
      members: [me, mira],
      lastMessagePreview: undefined,
      lastActivityAt: now - 26 * hour,
      unreadCount: 0,
      hiddenCount: 0,
    },
  ];
}

export function mockMessages(me: UserProfile): Record<string, UiMessage[]> {
  const day = 24 * hour;
  return {
    "c-ava": [
      { id: "m-a1", conversationId: "c-ava", senderId: "u-ava", senderName: "Ava Sterling", kind: "text", text: "Pushed the new bubble tokens. Outgoing messages finally have that brushed metal sheen.", createdAt: now - day - 38 * min, outgoing: false, readBy: [me.id] },
      { id: "m-a2", conversationId: "c-ava", senderId: me.id, senderName: me.displayName, kind: "text", text: "Saw it — the titanium gradient is subtle enough. Not neon, not flat.", createdAt: now - day - 31 * min, outgoing: true, readBy: ["u-ava"] },
      { id: "m-a3", conversationId: "c-ava", senderId: "u-ava", senderName: "Ava Sterling", kind: "text", text: "Exactly what we were aiming for.", createdAt: now - 32 * min, outgoing: false, readBy: [me.id] },
      { id: "m-a3b", conversationId: "c-ava", senderId: "u-ava", senderName: "Ava Sterling", kind: "image", imageUrl: "/locat-mark.png", imageAlt: "Approved logo artwork", createdAt: now - 20 * min, outgoing: false, readBy: [me.id] },
      { id: "m-a4", conversationId: "c-ava", senderId: me.id, senderName: me.displayName, kind: "text", text: "The reply bar with the steel accent is my favourite detail.", createdAt: now - 12 * min, outgoing: true, readBy: ["u-ava"] },
      { id: "m-a5", conversationId: "c-ava", senderId: "u-ava", senderName: "Ava Sterling", kind: "text", text: "The glass header feels right at last.", createdAt: now - 4 * min, outgoing: false, readBy: [] },
    ],
    "c-titanium": [
      { id: "m-g1", conversationId: "c-titanium", senderId: "u-noah", senderName: "Noah Reyes", kind: "text", text: "Relay stayed up all weekend. Zero dropped envelopes.", createdAt: now - day - 90 * min, outgoing: false, readBy: [me.id, "u-ava", "u-mira"] },
      { id: "m-g2", conversationId: "c-titanium", senderId: me.id, senderName: me.displayName, kind: "text", text: "Nice. Storage footprint still flat?", createdAt: now - day - 84 * min, outgoing: true, readBy: ["u-ava", "u-noah", "u-mira", "u-elias"] },
      { id: "m-g3", conversationId: "c-titanium", senderId: "u-ava", senderName: "Ava Sterling", kind: "file", fileName: "titanium-tokens.fig", fileSizeKb: 842, createdAt: now - 61 * min, outgoing: false, readBy: [me.id] },
      { id: "m-g4", conversationId: "c-titanium", senderId: "u-mira", senderName: "Mira Chen", kind: "text", text: "key rotation landed cleanly.", createdAt: now - 42 * min, outgoing: false, readBy: [] },
    ],
    "c-noah": [
      { id: "m-n1", conversationId: "c-noah", senderId: "u-noah", senderName: "Noah Reyes", kind: "voice", voiceDurationMs: 42_000, createdAt: now - 5 * hour, outgoing: false, readBy: [me.id] },
      { id: "m-n2", conversationId: "c-noah", senderId: me.id, senderName: me.displayName, kind: "text", text: "Listening on the ride home.", createdAt: now - 5 * hour + 6 * min, outgoing: true, readBy: ["u-noah"] },
      { id: "m-n3", conversationId: "c-noah", senderId: "u-noah", senderName: "Noah Reyes", kind: "text", text: "Old thread — hidden on this device.", createdAt: now - 2 * day, outgoing: false, readBy: [me.id], hidden: true },
      { id: "m-n4", conversationId: "c-noah", senderId: me.id, senderName: me.displayName, kind: "text", text: "Archiving this note for later.", createdAt: now - 2 * day + 3 * min, outgoing: true, readBy: ["u-noah"], hidden: true },
    ],
    "c-mira": [],
  };
}

/** Rotating canned replies used by the mock adapter's demo bot. */
export const MOCK_BOT_REPLIES = [
  "Got it — this reply comes from the mock adapter.",
  "Nice. The realtime event fired as expected.",
  "Seen. Swap in the real adapter and this becomes an encrypted message.",
  "Copy that. Everything you see is local mock state.",
];
