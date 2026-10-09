/**
 * Locat UI kit — shared TypeScript contracts.
 *
 * These interfaces are the integration surface between the UI and any data
 * source. The real Locat app maps its tRPC/Drizzle models onto these shapes;
 * the bundled mock adapter (src/mock/) satisfies them for development.
 * UI components must never import from src/mock — only from this file and
 * src/adapter.ts.
 */

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  /** Public Locat code, e.g. "LC-6863". */
  lcCode: string;
  /** 0–360 hue used for the identicon avatar when no photo exists. */
  avatarHue: number;
  avatarUrl?: string | null;
  online?: boolean;
}

export type ConversationType = "direct" | "group";

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  /** Group name; direct conversations derive the title from the other member. */
  name?: string;
  members: UserProfile[];
  lastMessagePreview?: string;
  lastActivityAt: number;
  unreadCount: number;
  archived?: boolean;
  hiddenCount: number;
}

export type MessageKind = "text" | "image" | "file" | "voice";

export interface UiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  kind: MessageKind;
  text?: string;
  fileName?: string;
  fileSizeKb?: number;
  voiceDurationMs?: number;
  imageUrl?: string;
  imageAlt?: string;
  createdAt: number;
  editedAt?: number;
  outgoing: boolean;
  pending?: boolean;
  failed?: boolean;
  readBy: string[];
  hidden?: boolean;
}

export interface RegisterInput {
  username: string;
  displayName: string;
  password: string;
}

export type AdapterEvent =
  | { type: "message"; message: UiMessage }
  | { type: "read"; conversationId: string; userId: string }
  | { type: "presence"; userId: string; online: boolean }
  | { type: "request"; from: UserProfile };
