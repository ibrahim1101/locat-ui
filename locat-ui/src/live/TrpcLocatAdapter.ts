/**
 * ============================================================================
 * STARTER — live tRPC adapter skeleton for the real Locat backend.
 *
 * This class pre-maps every LocatUiAdapter method to the real procedure names
 * in the Locat app (api/router.ts: auth / users / conversations / messages).
 * It compiles standalone against a minimal client interface so the UI kit has
 * no dependency on the app's generated AppRouter type.
 *
 * What is DONE here: procedure wiring, argument shapes, and model mapping
 * scaffolds. What is intentionally LEFT as TODO: decryption/encryption and
 * IndexedDB access — those must call the app's existing lib/crypto + lib/localdb
 * code paths exactly as the current Chat page does. Do not reimplement them.
 *
 * Usage inside the real app (after copying this file into it):
 *   const adapter = new TrpcLocatAdapter(trpcClient, cryptoHooks);
 *   <App adapter={adapter} />
 * ============================================================================
 */
import type { LocatUiAdapter } from "../adapter";
import type {
  AdapterEvent,
  ConversationSummary,
  RegisterInput,
  UiMessage,
  UserProfile,
} from "../types";

/** Minimal structural subset of the app's tRPC vanilla client. */
export interface TrpcClientLike {
  query(procedure: string, input?: unknown): Promise<unknown>;
  mutation(procedure: string, input?: unknown): Promise<unknown>;
  subscription(
    procedure: string,
    input: unknown,
    handlers: { onData(data: unknown): void; onError?(error: unknown): void },
  ): { unsubscribe(): void };
}

/**
 * Hooks into the app's existing security/storage layer. Implement these by
 * delegating to lib/crypto and lib/localdb — never by writing new crypto.
 */
export interface LiveCryptoHooks {
  /** Current session user id + keys, e.g. from state/auth once unlocked. */
  getSession(): { userId: number; username: string };
  /** Decrypt one stored/synced envelope into a UiMessage (lib/crypto + localdb). */
  decryptEnvelope(conversationId: string, envelope: unknown): Promise<UiMessage>;
  /** Encrypt plaintext for a conversation, returning the payload for messages.send. */
  encryptText(conversationId: string, text: string): Promise<unknown>;
  /** Encrypt an image/file/voice payload, returning the payload for messages.send. */
  encryptAttachment(conversationId: string, kind: "image" | "file" | "voice", data: unknown): Promise<unknown>;
  /** Generate + wrap a fresh group key for the given member ids (GroupDialog does this today). */
  wrapGroupKeysFor(memberIds: number[]): Promise<{ wrappedKeys: unknown[] }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map the app's PublicUser (numeric id) onto the UI kit's UserProfile. */
export function mapUser(raw: any): UserProfile {
  return {
    id: String(raw.id),
    username: raw.username ?? "",
    displayName: raw.displayName ?? "Unknown",
    bio: raw.bio ?? "",
    lcCode: raw.lcCode ? `LC-${raw.lcCode}` : "",
    avatarHue: (Number(raw.id) * 47) % 360, // app tints identicons from the numeric id
    avatarUrl: raw.avatar ?? null,
    online: Boolean(raw.online),
  };
}

/** Map the app's ConversationSummary onto the kit's shape. */
export function mapConversation(raw: any): ConversationSummary {
  return {
    id: String(raw.id),
    type: raw.type === "group" ? "group" : "direct",
    name: raw.name ?? undefined,
    members: (raw.members ?? []).map(mapUser),
    lastMessagePreview: raw.lastMessagePreview ?? undefined,
    lastActivityAt: Number(raw.lastActivityAt ?? raw.updatedAt ?? Date.now()),
    unreadCount: Number(raw.unreadCount ?? 0),
    archived: Boolean(raw.archived),
    hiddenCount: Number(raw.hiddenCount ?? 0),
  };
}

export class TrpcLocatAdapter implements LocatUiAdapter {
  constructor(
    private readonly client: TrpcClientLike,
    private readonly crypto: LiveCryptoHooks,
  ) {}

  // --- auth (api/authRouter.ts) -------------------------------------------
  async signIn(username: string, password: string): Promise<UserProfile> {
    // Real app: auth.login is a query-style procedure returning the session;
    // key unlock happens in state/auth after this resolves.
    const session: any = await this.client.query("auth.login", { username, password });
    return mapUser(session.user ?? session);
  }

  async register(input: RegisterInput): Promise<UserProfile> {
    const session: any = await this.client.query("auth.register", input);
    return mapUser(session.user ?? session);
  }

  async signOut(): Promise<void> {
    await this.client.mutation("auth.logout");
  }

  // --- conversations (api/conversationsRouter.ts) ---------------------------
  async listConversations(): Promise<ConversationSummary[]> {
    const rows: any = await this.client.query("conversations.list");
    return (rows ?? []).map(mapConversation);
  }

  async listMessages(conversationId: string): Promise<UiMessage[]> {
    // TODO(security): read decrypted history from IndexedDB (lib/localdb) and,
    // if stale, pull envelopes via messages.sync then decryptEnvelope each.
    void conversationId;
    throw new Error("TrpcLocatAdapter.listMessages: wire to lib/localdb + messages.sync (see TODO).");
  }

  async markRead(conversationId: string): Promise<void> {
    // Real app sends read receipts through messages.ack.
    await this.client.mutation("messages.ack", { conversationId: Number(conversationId) });
  }

  // --- messages (api/messagesRouter.ts) --------------------------------------
  async sendText(conversationId: string, text: string): Promise<UiMessage> {
    const payload = await this.crypto.encryptText(conversationId, text);
    const sent: any = await this.client.mutation("messages.send", {
      conversationId: Number(conversationId),
      payload,
    });
    return this.crypto.decryptEnvelope(conversationId, sent);
  }

  async sendImage(conversationId: string, imageUrl: string, alt: string): Promise<UiMessage> {
    const payload = await this.crypto.encryptAttachment(conversationId, "image", { imageUrl, alt });
    const sent: any = await this.client.mutation("messages.send", { conversationId: Number(conversationId), payload });
    return this.crypto.decryptEnvelope(conversationId, sent);
  }

  async sendFile(conversationId: string, fileName: string, sizeKb: number): Promise<UiMessage> {
    const payload = await this.crypto.encryptAttachment(conversationId, "file", { fileName, sizeKb });
    const sent: any = await this.client.mutation("messages.send", { conversationId: Number(conversationId), payload });
    return this.crypto.decryptEnvelope(conversationId, sent);
  }

  async sendVoice(conversationId: string, durationMs: number): Promise<UiMessage> {
    const payload = await this.crypto.encryptAttachment(conversationId, "voice", { durationMs });
    const sent: any = await this.client.mutation("messages.send", { conversationId: Number(conversationId), payload });
    return this.crypto.decryptEnvelope(conversationId, sent);
  }

  async editMessage(messageId: string, text: string): Promise<UiMessage> {
    // TODO(security): edits travel as encrypted control payloads in the real app.
    void messageId; void text;
    throw new Error("TrpcLocatAdapter.editMessage: wire to the app's encrypted edit control.");
  }

  async deleteMessage(messageId: string): Promise<void> {
    // TODO(security): local delete from IndexedDB (lib/localdb), mirroring Chat page behaviour.
    void messageId;
  }

  async toggleMessageHidden(messageId: string): Promise<UiMessage> {
    // TODO(security): hidden is a local-only flag in IndexedDB in the real app.
    void messageId;
    throw new Error("TrpcLocatAdapter.toggleMessageHidden: wire to lib/localdb hidden flag.");
  }

  // --- people (api/usersRouter.ts) --------------------------------------------
  async searchPeople(query: string): Promise<UserProfile[]> {
    const rows: any = await this.client.query("users.search", { q: query });
    return (rows ?? []).map(mapUser);
  }

  async listFriends(): Promise<UserProfile[]> {
    const rows: any = await this.client.query("users.contacts");
    return (rows ?? []).map(mapUser);
  }

  async listRequests(): Promise<UserProfile[]> {
    const rows: any = await this.client.query("users.contactRequests");
    return (rows ?? [])
      .filter((row: any) => row.direction === "incoming")
      .map((row: any) => mapUser(row.user));
  }

  async openDirect(userId: string): Promise<ConversationSummary> {
    const result: any = await this.client.mutation("conversations.createDirect", { userId: Number(userId) });
    const list = await this.listConversations();
    const found = list.find(c => c.id === String(result.conversationId));
    if (!found) throw new Error("Conversation created but not returned by conversations.list.");
    return found;
  }

  async sendRequest(userId: string): Promise<void> {
    await this.client.mutation("users.requestContact", { userId: Number(userId) });
  }

  async acceptRequest(userId: string): Promise<void> {
    // contactRequests rows carry { id, user }; accept via respondContact.
    const rows: any = await this.client.query("users.contactRequests");
    const row = (rows ?? []).find((r: any) => String(r.user.id) === userId && r.direction === "incoming");
    if (!row) throw new Error("Request not found.");
    await this.client.mutation("users.respondContact", { requestId: row.id, accept: true });
  }

  async declineRequest(userId: string): Promise<void> {
    const rows: any = await this.client.query("users.contactRequests");
    const row = (rows ?? []).find((r: any) => String(r.user.id) === userId && r.direction === "incoming");
    if (!row) return;
    await this.client.mutation("users.respondContact", { requestId: row.id, accept: false });
  }

  async removeFriend(userId: string): Promise<void> {
    await this.client.mutation("users.removeContact", { userId: Number(userId) });
  }

  async createGroup(name: string, memberIds: string[]): Promise<ConversationSummary> {
    // TODO(security): wrappedKeys must be produced by the app's group-key flow
    // (see GroupDialog.tsx: generateGroupKey + wrapGroupKey per member).
    const { wrappedKeys } = await this.crypto.wrapGroupKeysFor(memberIds.map(Number));
    await this.client.mutation("conversations.createGroup", {
      name,
      memberIds: memberIds.map(Number),
      wrappedKeys,
    });
    const list = await this.listConversations();
    const created = list.find(c => c.name === name && c.type === "group");
    if (!created) throw new Error("Group created but not returned by conversations.list.");
    return created;
  }

  // --- profile (api/usersRouter.ts) ---------------------------------------------
  async updateProfile(patch: Partial<Pick<UserProfile, "displayName" | "bio">>): Promise<UserProfile> {
    const updated: any = await this.client.mutation("users.updateProfile", patch);
    return mapUser(updated); // adjust if the procedure returns { user } instead of the profile row
  }

  // --- realtime (api/messagesRouter.ts subscribe subscription) --------------------
  onEvent(listener: (event: AdapterEvent) => void): () => void {
    void listener; // TODO: invoke with decrypted messages once the crypto hooks are wired
    const sub = this.client.subscription("messages.subscribe", {}, {
      onData: (envelope: unknown) => {
        // TODO(security): decrypt envelopes and emit { type: "message", message }.
        // Read receipts map to { type: "read", conversationId, userId }.
        void envelope;
      },
      onError: () => undefined,
    });
    return () => sub.unsubscribe();
  }
}
