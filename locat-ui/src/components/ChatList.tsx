/** Conversation list: search, Chats/Hidden segmented tabs, rows with presence + unread. */
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ConversationSummary, UserProfile } from "../types";
import { listTimeLabel } from "../lib/format";
import { Avatar, AvatarStack } from "./Avatar";
import { ChatListSkeleton } from "./states";
import { ErrorState } from "./states";
import { cn, Input, Segmented } from "./ui";

export function conversationTitle(conv: ConversationSummary, meId: string): { title: string; subtitle: string } {
  if (conv.type === "direct") {
    const other = conv.members.find(m => m.id !== meId);
    return { title: other?.displayName ?? "Unknown", subtitle: other ? `@${other.username}` : "" };
  }
  return { title: conv.name ?? "Group", subtitle: `${conv.members.length} members` };
}

export function otherMember(conv: ConversationSummary, meId: string): UserProfile | undefined {
  return conv.type === "direct" ? conv.members.find(m => m.id !== meId) : undefined;
}

export function ChatList({
  conversations,
  activeId,
  meId,
  loading,
  error,
  onRetry,
  onSelect,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  meId: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelect: (conversationId: string) => void;
}) {
  const [tab, setTab] = useState<"chats" | "hidden">("chats");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const byTab = conversations.filter(c => (tab === "hidden" ? c.hiddenCount > 0 : c.hiddenCount === 0 || true));
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(c => {
      const { title, subtitle } = conversationTitle(c, meId);
      return title.toLowerCase().includes(q) || subtitle.toLowerCase().includes(q) || (c.lastMessagePreview ?? "").toLowerCase().includes(q);
    });
  }, [conversations, tab, query, meId]);

  if (loading) return <ChatListSkeleton />;
  if (error) return <ErrorState title="Conversations unavailable" error={error} onRetry={onRetry} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pb-2">
        <Segmented
          ariaLabel="Conversation visibility"
          value={tab}
          onChange={setTab}
          options={[
            { value: "chats", label: "Chats" },
            { value: "hidden", label: `Hidden chats (${conversations.reduce((n, c) => n + c.hiddenCount, 0)})` },
          ]}
        />
      </div>
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <Input
            aria-label="Search conversations"
            placeholder="Search chats…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="rounded-full pl-10"
          />
        </div>
      </div>
      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {visible.length === 0 && (
          <p className="micro-label px-4 py-10 text-center normal-case leading-relaxed tracking-normal">
            {tab === "hidden" ? "No hidden conversations." : query ? "Nothing matches your search." : "No visible conversations yet.\nOpen People & requests to find someone."}
          </p>
        )}
        {visible.map(conv => {
          const { title, subtitle } = conversationTitle(conv, meId);
          const other = otherMember(conv, meId);
          const active = conv.id === activeId;
          return (
            <button
              key={conv.id}
              type="button"
              data-testid={`conversation-row-${conv.id}`}
              onClick={() => onSelect(conv.id)}
              aria-current={active}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border border-transparent p-2.5 text-left transition-colors",
                active ? "smoked-glass" : "hover:bg-accent/60",
              )}
            >
              {conv.type === "direct" && other ? (
                <Avatar user={other} size={44} showPresence />
              ) : (
                <AvatarStack members={conv.members.filter(m => m.id !== meId)} size={40} />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{title}</span>
                  <span className="micro-label shrink-0">{listTimeLabel(conv.lastActivityAt)}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-secondary">
                    {conv.lastMessagePreview ?? subtitle}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="bg-steel flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-background">
                      {conv.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
