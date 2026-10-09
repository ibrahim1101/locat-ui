/**
 * ChatsScreen — the main shell: sidebar conversation list + conversation pane,
 * navigation drawer, people/settings dialogs. Responsive: single pane on
 * phones (list ⇄ chat), split view from md up. All data via LocatUiAdapter.
 */
import { Menu, MoveRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LocatUiAdapter } from "../adapter";
import { Avatar } from "../components/Avatar";
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";
import { Drawer } from "../components/Drawer";
import { PeopleDialog } from "../components/PeopleDialog";
import { GroupDialog, ProfileDialog } from "../components/ProfileDialog";
import { SettingsSheet } from "../components/SettingsSheet";
import { LocatWordmark } from "../components/brand";
import { EmptyState, MessageSkeleton, OfflineBanner } from "../components/states";
import { IconButton, cn } from "../components/ui";
import type { Accent, ThemeMode } from "../theme/tokens";
import type { ConversationSummary, UiMessage, UserProfile } from "../types";

export function ChatsScreen({
  adapter,
  me: initialMe,
  theme,
  accent,
  onThemeChange,
  onAccentChange,
  onOpenGallery,
  onSignOut,
}: {
  adapter: LocatUiAdapter;
  me: UserProfile;
  theme: ThemeMode;
  accent: Accent;
  onThemeChange: (theme: ThemeMode) => void;
  onAccentChange: (accent: Accent) => void;
  onOpenGallery: () => void;
  onSignOut: () => void;
}) {
  const [me, setMe] = useState(initialMe);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [groupConv, setGroupConv] = useState<ConversationSummary | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadConversations = useCallback(() => {
    setListLoading(true);
    setListError(null);
    adapter.listConversations()
      .then(setConversations)
      .catch((e: unknown) => setListError(e instanceof Error ? e.message : "Could not load conversations."))
      .finally(() => setListLoading(false));
  }, [adapter]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const goOffline = () => setOnline(false);
    const goOnline = () => setOnline(true);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  useEffect(() => {
    if (!peopleOpen) return;
    void adapter.listFriends().then(setFriends);
    void adapter.listRequests().then(setRequests);
  }, [peopleOpen, adapter]);

  // realtime: incoming messages, read receipts, presence
  useEffect(() => {
    return adapter.onEvent(event => {
      if (event.type === "message") {
        if (event.message.conversationId === activeIdRef.current) {
          setMessages(prev => [...prev, event.message]);
          void adapter.markRead(event.message.conversationId);
        }
        setConversations(prev => prev.map(c =>
          c.id === event.message.conversationId
            ? { ...c, lastMessagePreview: event.message.text ?? event.message.kind, lastActivityAt: event.message.createdAt, unreadCount: c.id === activeIdRef.current ? 0 : c.unreadCount + 1 }
            : c,
        ));
      }
      if (event.type === "read") {
        setMessages(prev => prev.map(m =>
          m.outgoing && !m.readBy.includes(event.userId) ? { ...m, readBy: [...m.readBy, event.userId] } : m,
        ));
      }
    });
  }, [adapter]);

  const active = conversations.find(c => c.id === activeId) ?? null;

  function selectConversation(id: string) {
    setActiveId(id);
    setMessagesLoading(true);
    void adapter.listMessages(id).then(list => { setMessages(list); setMessagesLoading(false); });
    void adapter.markRead(id);
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, unreadCount: 0 } : c)));
  }

  function optimisticSend(kind: "text" | "image" | "file" | "voice", payload: string, extra?: Partial<UiMessage>) {
    if (!active) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: UiMessage = {
      id: tempId,
      conversationId: active.id,
      senderId: me.id,
      senderName: me.displayName,
      kind,
      text: kind === "text" ? payload : undefined,
      createdAt: Date.now(),
      outgoing: true,
      pending: true,
      readBy: [],
      ...extra,
    };
    setMessages(prev => [...prev, optimistic]);
    const settle = (p: Promise<UiMessage>) =>
      p.then(final => setMessages(prev => prev.map(m => (m.id === tempId ? final : m))))
        .catch(() => setMessages(prev => prev.map(m => (m.id === tempId ? { ...optimistic, pending: false, failed: true } : m))));
    if (kind === "text") void settle(adapter.sendText(active.id, payload));
    else if (kind === "image") void settle(adapter.sendImage(active.id, payload, extra?.imageAlt ?? "Photo"));
    else if (kind === "file") void settle(adapter.sendFile(active.id, payload, extra?.fileSizeKb ?? 1));
    else void settle(adapter.sendVoice(active.id, extra?.voiceDurationMs ?? 1000));
    setConversations(prev => prev.map(c => (c.id === active.id ? { ...c, lastMessagePreview: kind === "text" ? payload : kind, lastActivityAt: Date.now() } : c)));
  }

  function focusSearch() {
    window.setTimeout(() => {
      (document.querySelector('[aria-label="Search conversations"]') as HTMLInputElement | null)?.focus();
    }, 80);
  }

  const openDirect = useCallback((user: UserProfile) => {
    void adapter.openDirect(user.id).then(conv => {
      setConversations(prev => (prev.some(c => c.id === conv.id) ? prev : [conv, ...prev]));
      selectConversation(conv.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter]);

  return (
    <div className="app-height flex flex-col" data-testid="chats-screen">
      <OfflineBanner visible={!online} />
      <div className="flex min-h-0 flex-1">
        {/* sidebar */}
        <aside className={cn("flex w-full min-w-0 flex-col border-r border-border/60 md:w-[340px] md:shrink-0", activeId && "hidden md:flex")}>
          <div className="locat-divider flex items-center gap-2.5 border-b px-3 py-2.5">
            <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)} className="locat-control locat-icon-button" data-testid="open-drawer">
              <Menu className="h-5 w-5" />
            </IconButton>
            <button type="button" aria-label="Open settings" onClick={() => setSettingsOpen(true)} className="rounded-full transition-transform active:scale-95">
              <Avatar user={me} size={36} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate"><LocatWordmark className="text-lg" /></p>
              <p className="micro-label truncate">@{me.username} · {me.lcCode}</p>
            </div>
          </div>
          <ChatList
            conversations={conversations}
            activeId={activeId}
            meId={me.id}
            loading={listLoading}
            error={listError}
            onRetry={loadConversations}
            onSelect={selectConversation}
          />
          <p className="micro-label border-t border-border/60 px-4 py-2.5">
            Locat · {online ? "Connected" : "Offline"} · UI kit v1.0.0 · Mock adapter
          </p>
        </aside>

        {/* conversation pane */}
        <main className={cn("min-w-0 flex-1", !activeId && "hidden md:block")}>
          {active ? (
            messagesLoading ? <MessageSkeleton /> : (
              <ChatWindow
                conversation={active}
                messages={messages}
                me={me}
                onBack={() => setActiveId(null)}
                onSendText={text => optimisticSend("text", text)}
                onSendImage={file => optimisticSend("image", URL.createObjectURL(file), { imageAlt: file.name })}
                onSendFile={file => optimisticSend("file", file.name, { fileName: file.name, fileSizeKb: Math.max(1, Math.ceil(file.size / 1024)) })}
                onSendVoice={durationMs => optimisticSend("voice", "", { voiceDurationMs: durationMs })}
                onEdit={(id, text) => void adapter.editMessage(id, text).then(updated => setMessages(prev => prev.map(m => (m.id === id ? updated : m))))}
                onDelete={id => { void adapter.deleteMessage(id); setMessages(prev => prev.filter(m => m.id !== id)); }}
                onToggleHidden={id => void adapter.toggleMessageHidden(id).then(updated => setMessages(prev => prev.map(m => (m.id === id ? updated : m))))}
                onOpenProfile={setProfileUser}
                onOpenGroup={setGroupConv}
              />
            )
          ) : (
            <EmptyState
              icon={<MoveRight className="h-6 w-6" />}
              title="Pick a conversation"
              hint="End-to-end encrypted · Saved on your device"
            />
          )}
        </main>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        me={me}
        theme={theme}
        accent={accent}
        onThemeChange={onThemeChange}
        onAccentChange={onAccentChange}
        onOpenPeople={() => setPeopleOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGallery={onOpenGallery}
        onSignOut={onSignOut}
        onFocusSearch={focusSearch}
      />
      <PeopleDialog
        open={peopleOpen}
        onClose={() => setPeopleOpen(false)}
        friends={friends}
        requests={requests}
        onSearchPeople={q => adapter.searchPeople(q)}
        onSendRequest={id => adapter.sendRequest(id)}
        onAccept={id => adapter.acceptRequest(id).then(() => { setRequests(prev => prev.filter(r => r.id !== id)); loadConversations(); })}
        onDecline={id => adapter.declineRequest(id).then(() => setRequests(prev => prev.filter(r => r.id !== id)))}
        onRemove={id => adapter.removeFriend(id).then(() => setFriends(prev => prev.filter(f => f.id !== id)))}
        onMessage={openDirect}
        onCreateGroup={(name, ids) => adapter.createGroup(name, ids).then(conv => {
          setConversations(prev => [conv, ...prev]);
          selectConversation(conv.id);
        })}
      />
      <ProfileDialog user={profileUser} onClose={() => setProfileUser(null)} onMessage={openDirect} />
      <GroupDialog conversation={groupConv} meId={me.id} onClose={() => setGroupConv(null)} onOpenProfile={setProfileUser} />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        me={me}
        theme={theme}
        accent={accent}
        onThemeChange={onThemeChange}
        onAccentChange={onAccentChange}
        onSaveProfile={async patch => { setMe(await adapter.updateProfile(patch)); }}
        onOpenGallery={onOpenGallery}
      />
    </div>
  );
}
