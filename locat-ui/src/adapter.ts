/**
 * LocatUiAdapter — the single integration seam between the Locat UI kit and a
 * data layer.
 *
 * The UI ships with MockLocatAdapter (src/mock/adapter.ts). To integrate with
 * the real Locat app, implement this interface over the existing tRPC client
 * and local encrypted store, then pass your implementation to <App adapter={…} />
 * or the individual screens. No UI component talks to the network directly.
 *
 * See docs/LOCAT_INTEGRATION.md for a method-by-method mapping.
 */
import type {
  AdapterEvent,
  ConversationSummary,
  RegisterInput,
  UiMessage,
  UserProfile,
} from "./types";

export interface LocatUiAdapter {
  // --- auth -------------------------------------------------------------
  /** Real app: verify credentials against the Hono auth endpoints. */
  signIn(username: string, password: string): Promise<UserProfile>;
  /** Real app: register, then derive/ store keys exactly as the real flow. */
  register(input: RegisterInput): Promise<UserProfile>;
  signOut(): Promise<void>;

  // --- conversations ------------------------------------------------------
  listConversations(): Promise<ConversationSummary[]>;
  listMessages(conversationId: string): Promise<UiMessage[]>;
  markRead(conversationId: string): Promise<void>;

  // --- messages -----------------------------------------------------------
  sendText(conversationId: string, text: string): Promise<UiMessage>;
  sendImage(conversationId: string, imageUrl: string, alt: string): Promise<UiMessage>;
  sendFile(conversationId: string, fileName: string, sizeKb: number): Promise<UiMessage>;
  sendVoice(conversationId: string, durationMs: number): Promise<UiMessage>;
  editMessage(messageId: string, text: string): Promise<UiMessage>;
  deleteMessage(messageId: string): Promise<void>;
  toggleMessageHidden(messageId: string): Promise<UiMessage>;

  // --- people ---------------------------------------------------------------
  searchPeople(query: string): Promise<UserProfile[]>;
  listFriends(): Promise<UserProfile[]>;
  listRequests(): Promise<UserProfile[]>;
  /** Open (or create) the direct conversation with a user. */
  openDirect(userId: string): Promise<ConversationSummary>;
  sendRequest(userId: string): Promise<void>;
  acceptRequest(userId: string): Promise<void>;
  declineRequest(userId: string): Promise<void>;
  removeFriend(userId: string): Promise<void>;
  createGroup(name: string, memberIds: string[]): Promise<ConversationSummary>;

  // --- profile --------------------------------------------------------------
  updateProfile(patch: Partial<Pick<UserProfile, "displayName" | "bio">>): Promise<UserProfile>;

  // --- realtime -------------------------------------------------------------
  /** Subscribe to incoming events. Returns an unsubscribe function. */
  onEvent(listener: (event: AdapterEvent) => void): () => void;
}
