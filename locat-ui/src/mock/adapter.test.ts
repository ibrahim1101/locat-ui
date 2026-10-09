/** Mock adapter contract test — the same calls the UI makes. */
import { describe, expect, it } from "vitest";
import { MockLocatAdapter } from "./adapter";

describe("MockLocatAdapter", () => {
  it("signs in with any demo credentials and lists seeded conversations", async () => {
    const adapter = new MockLocatAdapter();
    const me = await adapter.signIn("demo", "anything-works");
    expect(me.username).toBe("demo");
    expect(me.lcCode).toMatch(/^LC-\d{4}$/);
    const conversations = await adapter.listConversations();
    expect(conversations.length).toBeGreaterThanOrEqual(3);
    expect(conversations.some(c => c.type === "group")).toBe(true);
  });

  it("sends a text message and emits a bot reply + read receipt", async () => {
    const adapter = new MockLocatAdapter();
    await adapter.signIn("demo", "x");
    const events: string[] = [];
    adapter.onEvent(e => events.push(e.type));
    const sent = await adapter.sendText("c-ava", "hello titanium");
    expect(sent.outgoing).toBe(true);
    const messages = await adapter.listMessages("c-ava");
    expect(messages.at(-1)?.text).toBe("hello titanium");
    // the demo bot reads after ~900ms and replies after ~1600ms
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(events).toContain("read");
    expect(events).toContain("message");
    const after = await adapter.listMessages("c-ava");
    expect(after.at(-1)?.outgoing).toBe(false);
    expect(after.find(m => m.id === sent.id)?.readBy.length).toBe(1);
  }, 8000);

  it("edits, hides and deletes messages", async () => {
    const adapter = new MockLocatAdapter();
    await adapter.signIn("demo", "x");
    const sent = await adapter.sendText("c-noah", "temporary");
    const edited = await adapter.editMessage(sent.id, "edited text");
    expect(edited.text).toBe("edited text");
    expect(edited.editedAt).toBeDefined();
    const hidden = await adapter.toggleMessageHidden(sent.id);
    expect(hidden.hidden).toBe(true);
    await adapter.deleteMessage(sent.id);
    const remaining = await adapter.listMessages("c-noah");
    expect(remaining.some(m => m.id === sent.id)).toBe(false);
  });

  it("accepts requests and creates groups", async () => {
    const adapter = new MockLocatAdapter();
    await adapter.signIn("demo", "x");
    const requests = await adapter.listRequests();
    expect(requests.length).toBeGreaterThan(0);
    await adapter.acceptRequest(requests[0].id);
    expect(await adapter.listRequests()).toHaveLength(requests.length - 1);
    const group = await adapter.createGroup("Test Group", ["u-ava", "u-noah"]);
    expect(group.members).toHaveLength(3);
    const conversations = await adapter.listConversations();
    expect(conversations[0].id).toBe(group.id);
  });
});
