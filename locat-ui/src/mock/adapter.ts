/**
 * ============================================================================
 * MOCK ADAPTER — development only. Implements LocatUiAdapter with in-memory
 * state and simulated latency so the full UI runs without any backend.
 * Replace with a tRPC-backed adapter during integration (see
 * docs/LOCAT_INTEGRATION.md). No secrets or real credentials exist here:
 * signIn/register accept any non-empty input and mint a local demo session.
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
import {
  MOCK_BOT_REPLIES,
  MOCK_CONTACTS,
  MOCK_REQUESTS,
  MOCK_STRANGERS,
  mockConversations,
  mockMessages,
} from "./data";

const latency = (ms = 320) => new Promise<void>(resolve => setTimeout(resolve, ms));
let seq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq++}`;

function hueFrom(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export class MockLocatAdapter implements LocatUiAdapter {
  private me: UserProfile | null = null;
  private conversations: ConversationSummary[] = [];
  private messages: Record<string, UiMessage[]> = {};
  private friends: UserProfile[] = [...MOCK_CONTACTS];
  private requests: UserProfile[] = [...MOCK_REQUESTS];
  private listeners = new Set<(e: AdapterEvent) => void>();
  private replyIndex = 0;

  private emit(event: AdapterEvent) {
    this.listeners.forEach(fn => fn(event));
  }

  private requireSession(): UserProfile {
    if (!this.me) throw new Error("MockLocatAdapter: not signed in");
    return me(this);
  }

  // --- auth -----------------------------------------------------------------
  async signIn(username: string, _password: string): Promise<UserProfile> {
    await latency(450);
    if (!username.trim()) throw new Error("Username is required.");
    this.me = this.makeUser(username);
    this.seed();
    return this.me;
  }

  async register(input: RegisterInput): Promise<UserProfile> {
    await latency(650);
    this.me = this.makeUser(input.username, input.displayName);
    this.seed();
    return this.me;
  }

  async signOut(): Promise<void> {
    await latency(150);
    this.me = null;
    this.conversations = [];
    this.messages = {};
  }

  private makeUser(username: string, displayName?: string): UserProfile {
    const clean = username.trim().toLowerCase();
    const code = String(1000 + (hueFrom(clean) % 9000));
    return {
      id: `me-${clean}`,
      username: clean,
      displayName: displayName?.trim() || clean.replace(/^\w/, c => c.toUpperCase()),
      bio: "Private by default.",
      lcCode: `LC-${code}`,
      avatarHue: hueFrom(clean),
      online: true,
    };
  }

  private seed() {
    const me = this.requireSession();
    this.conversations = mockConversations(me);
    this.messages = mockMessages(me);
  }

  // --- conversations ----------------------------------------------------------
  async listConversations(): Promise<ConversationSummary[]> {
    this.requireSession();
    await latency(480);
    return this.conversations.map(c => ({ ...c }));
  }

  async listMessages(conversationId: string): Promise<UiMessage[]> {
    this.requireSession();
    await latency(280);
    return [...(this.messages[conversationId] ?? [])];
  }

  async markRead(conversationId: string): Promise<void> {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) conv.unreadCount = 0;
  }

  // --- messages ---------------------------------------------------------------
  async sendText(conversationId: string, text: string): Promise<UiMessage> {
    const me = this.requireSession();
    await latency(380);
    const message: UiMessage = {
      id: nextId("m"),
      conversationId,
      senderId: me.id,
      senderName: me.displayName,
      kind: "text",
      text,
      createdAt: Date.now(),
      outgoing: true,
      readBy: [],
    };
    this.append(message);
    this.bumpConversation(conversationId, text);
    this.scheduleBotReply(conversationId, message);
    return message;
  }

  async sendImage(conversationId: string, imageUrl: string, alt: string): Promise<UiMessage> {
    const me = this.requireSession();
    await latency(450);
    const message: UiMessage = {
      id: nextId("m"),
      conversationId,
      senderId: me.id,
      senderName: me.displayName,
      kind: "image",
      imageUrl,
      imageAlt: alt,
      createdAt: Date.now(),
      outgoing: true,
      readBy: [],
    };
    this.append(message);
    this.bumpConversation(conversationId, "Photo");
    return message;
  }

  async sendFile(conversationId: string, fileName: string, sizeKb: number): Promise<UiMessage> {
    const me = this.requireSession();
    await latency(500);
    const message: UiMessage = {
      id: nextId("m"),
      conversationId,
      senderId: me.id,
      senderName: me.displayName,
      kind: "file",
      fileName,
      fileSizeKb: sizeKb,
      createdAt: Date.now(),
      outgoing: true,
      readBy: [],
    };
    this.append(message);
    this.bumpConversation(conversationId, fileName);
    return message;
  }

  async sendVoice(conversationId: string, durationMs: number): Promise<UiMessage> {
    const me = this.requireSession();
    await latency(400);
    const message: UiMessage = {
      id: nextId("m"),
      conversationId,
      senderId: me.id,
      senderName: me.displayName,
      kind: "voice",
      voiceDurationMs: durationMs,
      createdAt: Date.now(),
      outgoing: true,
      readBy: [],
    };
    this.append(message);
    this.bumpConversation(conversationId, "Voice message");
    return message;
  }

  async editMessage(messageId: string, text: string): Promise<UiMessage> {
    await latency(200);
    const found = this.findMessage(messageId);
    if (!found || found.kind !== "text") throw new Error("Message not editable.");
    found.text = text;
    found.editedAt = Date.now();
    return { ...found };
  }

  async deleteMessage(messageId: string): Promise<void> {
    await latency(200);
    for (const id of Object.keys(this.messages)) {
      this.messages[id] = this.messages[id].filter(m => m.id !== messageId);
    }
  }

  async toggleMessageHidden(messageId: string): Promise<UiMessage> {
    await latency(120);
    const found = this.findMessage(messageId);
    if (!found) throw new Error("Message not found.");
    found.hidden = !found.hidden;
    return { ...found };
  }

  // --- people -------------------------------------------------------------------
  async searchPeople(query: string): Promise<UserProfile[]> {
    await latency(350);
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = [...this.friends, ...MOCK_STRANGERS.filter(s => !this.friends.some(f => f.id === s.id))];
    return pool.filter(p =>
      p.displayName.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.lcCode.toLowerCase().includes(q),
    );
  }

  async listFriends(): Promise<UserProfile[]> {
    await latency(220);
    return [...this.friends];
  }

  async listRequests(): Promise<UserProfile[]> {
    await latency(220);
    return [...this.requests];
  }

  async openDirect(userId: string): Promise<ConversationSummary> {
    const me = this.requireSession();
    await latency(250);
    const existing = this.conversations.find(c => c.type === "direct" && c.members.some(m => m.id === userId));
    if (existing) return existing;
    const person = [...this.friends, ...MOCK_STRANGERS, ...this.requests].find(p => p.id === userId);
    if (!person) throw new Error("Unknown person.");
    const conv: ConversationSummary = {
      id: `c-${person.username}`,
      type: "direct",
      members: [me, person],
      lastActivityAt: Date.now(),
      unreadCount: 0,
      hiddenCount: 0,
    };
    this.conversations.unshift(conv);
    this.messages[conv.id] = this.messages[conv.id] ?? [];
    return conv;
  }

  async sendRequest(userId: string): Promise<void> {
    await latency(300);
    void userId; // mock: request stays pending forever
  }

  async acceptRequest(userId: string): Promise<void> {
    await latency(300);
    const person = this.requests.find(r => r.id === userId);
    if (!person) return;
    this.requests = this.requests.filter(r => r.id !== userId);
    this.friends.push(person);
    const me = this.requireSession();
    this.conversations.unshift({
      id: `c-${person.username}`,
      type: "direct",
      members: [me, person],
      lastActivityAt: Date.now(),
      unreadCount: 0,
      hiddenCount: 0,
    });
    this.messages[`c-${person.username}`] = [];
  }

  async declineRequest(userId: string): Promise<void> {
    await latency(250);
    this.requests = this.requests.filter(r => r.id !== userId);
  }

  async removeFriend(userId: string): Promise<void> {
    await latency(250);
    this.friends = this.friends.filter(f => f.id !== userId);
  }

  async createGroup(name: string, memberIds: string[]): Promise<ConversationSummary> {
    const me = this.requireSession();
    await latency(450);
    const members = [me, ...this.friends.filter(f => memberIds.includes(f.id))];
    const conv: ConversationSummary = {
      id: nextId("c"),
      type: "group",
      name: name.trim() || "New group",
      members,
      lastActivityAt: Date.now(),
      unreadCount: 0,
      hiddenCount: 0,
    };
    this.conversations.unshift(conv);
    this.messages[conv.id] = [];
    return conv;
  }

  // --- profile --------------------------------------------------------------------
  async updateProfile(patch: Partial<Pick<UserProfile, "displayName" | "bio">>): Promise<UserProfile> {
    const me = this.requireSession();
    await latency(300);
    this.me = { ...me, ...patch };
    return this.me;
  }

  // --- realtime ---------------------------------------------------------------------
  onEvent(listener: (event: AdapterEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- internals --------------------------------------------------------------------
  private append(message: UiMessage) {
    this.messages[message.conversationId] = [...(this.messages[message.conversationId] ?? []), message];
  }

  private bumpConversation(conversationId: string, preview: string) {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessagePreview = preview;
      conv.lastActivityAt = Date.now();
    }
  }

  private findMessage(messageId: string): UiMessage | undefined {
    for (const list of Object.values(this.messages)) {
      const hit = list.find(m => m.id === messageId);
      if (hit) return hit;
    }
    return undefined;
  }

  /** Demo bot: direct conversations answer after a short delay, then "read" your messages. */
  private scheduleBotReply(conversationId: string, sent: UiMessage) {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (!conv || conv.type !== "direct") return;
    const other = conv.members.find(m => m.id !== this.me?.id);
    if (!other) return;
    const me = this.requireSession();
    setTimeout(() => {
      this.emit({ type: "read", conversationId, userId: other.id });
      const list = this.messages[conversationId] ?? [];
      list.forEach(m => {
        if (m.outgoing && !m.readBy.includes(other.id)) m.readBy.push(other.id);
      });
      void sent;
    }, 900);
    setTimeout(() => {
      const reply: UiMessage = {
        id: nextId("m"),
        conversationId,
        senderId: other.id,
        senderName: other.displayName,
        kind: "text",
        text: MOCK_BOT_REPLIES[this.replyIndex++ % MOCK_BOT_REPLIES.length],
        createdAt: Date.now(),
        outgoing: false,
        readBy: [me.id],
      };
      this.append(reply);
      this.bumpConversation(conversationId, reply.text ?? "");
      const c = this.conversations.find(x => x.id === conversationId);
      if (c) c.unreadCount += 1;
      this.emit({ type: "message", message: reply });
    }, 1600);
  }
}

function me(adapter: MockLocatAdapter): UserProfile {
  // narrow helper so requireSession reads cleanly above
  return (adapter as unknown as { me: UserProfile }).me;
}
