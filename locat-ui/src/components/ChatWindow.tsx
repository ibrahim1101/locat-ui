/**
 * ChatWindow — conversation header, message canvas, and composer.
 * Mirrors the approved Locat conversation interface (titanium bubbles,
 * smoked-glass chrome, steel accents). All data flows through props.
 */
import {
  ArrowDown,
  ArrowLeft,
  ImagePlus,
  Mic,
  Paperclip,
  Reply,
  Search,
  SendHorizonal,
  ShieldCheck,
  Square,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { dayLabel, sameDay } from "../lib/format";
import type { ConversationSummary, UiMessage, UserProfile } from "../types";
import { Avatar, AvatarStack } from "./Avatar";
import { conversationTitle, otherMember } from "./ChatList";
import { DayDivider, MessageBubble } from "./MessageBubble";
import { Dialog, IconButton, cn } from "./ui";

export function ChatWindow({
  conversation,
  messages,
  me,
  onBack,
  onSendText,
  onSendImage,
  onSendFile,
  onSendVoice,
  onEdit,
  onDelete,
  onToggleHidden,
  onOpenProfile,
  onOpenGroup,
}: {
  conversation: ConversationSummary;
  messages: UiMessage[];
  me: UserProfile;
  onBack: () => void;
  onSendText: (text: string) => void;
  onSendImage: (file: File) => void;
  onSendFile: (file: File) => void;
  onSendVoice: (durationMs: number) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onOpenProfile: (user: UserProfile) => void;
  onOpenGroup: (conversation: ConversationSummary) => void;
}) {
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [recordingMs, setRecordingMs] = useState<number | null>(null);
  const nearBottom = useRef(true);
  const previousLength = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordTimer = useRef<number | null>(null);

  const { title, subtitle } = conversationTitle(conversation, me.id);
  const other = otherMember(conversation, me.id);
  const hiddenCount = messages.filter(m => m.hidden).length;

  const visibleMessages = useMemo(
    () =>
      messages
        .filter(m => Boolean(m.hidden) === showHidden)
        .filter(m => !searchOpen || !search || (m.kind === "text" && (m.text ?? "").toLowerCase().includes(search.toLowerCase()))),
    [messages, showHidden, searchOpen, search],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el && (nearBottom.current || (messages.length > previousLength.current && messages.at(-1)?.outgoing)))
      el.scrollTop = el.scrollHeight;
    previousLength.current = messages.length;
  }, [messages, conversation.id]);

  useEffect(() => () => { if (recordTimer.current !== null) window.clearInterval(recordTimer.current); }, []);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onSendText(reply ? `> ${reply.replaceAll("\n", "\n> ")}\n\n${text}` : text);
    setReply(null);
  }

  function toggleRecording() {
    if (recordingMs !== null) {
      if (recordTimer.current !== null) window.clearInterval(recordTimer.current);
      const duration = recordingMs;
      setRecordingMs(null);
      if (duration >= 500) onSendVoice(duration);
      return;
    }
    setRecordingMs(0);
    const started = Date.now();
    recordTimer.current = window.setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed >= 60_000) {
        if (recordTimer.current !== null) window.clearInterval(recordTimer.current);
        setRecordingMs(null);
        onSendVoice(60_000);
      } else setRecordingMs(elapsed);
    }, 100);
  }

  return (
    <div className="locat-chat flex h-full min-w-0 flex-col" data-testid="chat-window">
      {hiddenCount > 0 && (
        <div className="flex items-center justify-end gap-1.5 border-b border-border/60 px-3 py-1.5">
          <button
            type="button"
            aria-pressed={showHidden}
            onClick={() => { setShowHidden(v => !v); setSearch(""); setReply(null); }}
            className="min-h-9 rounded-full px-3.5 text-xs text-secondary transition-colors hover:bg-accent hover:text-foreground"
          >
            {showHidden ? "Back to messages" : `Hidden messages (${hiddenCount})`}
          </button>
        </div>
      )}

      {/* header */}
      <header className="smoked-glass pt-safe flex min-h-16 shrink-0 items-center gap-2.5 border-b border-border/60 px-3 sm:px-4">
        <IconButton onClick={onBack} aria-label="Back" className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        {conversation.type === "direct" && other ? (
          <button
            type="button"
            aria-label={`View ${title}'s profile`}
            onClick={() => onOpenProfile(other)}
            className="rounded-full transition-transform focus-visible:outline focus-visible:outline-2 active:scale-95"
          >
            <Avatar user={other} size={38} showPresence />
          </button>
        ) : (
          <AvatarStack members={conversation.members.filter(m => m.id !== me.id)} size={38} />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
          <p className={cn("micro-label normal-case tracking-normal", other?.online && "text-steel")}>
            {conversation.type === "direct" ? (other?.online ? "online" : subtitle) : subtitle}
          </p>
        </div>
        {conversation.type === "group" && (
          <IconButton aria-label="Group details" onClick={() => onOpenGroup(conversation)}>
            <Users className="h-5 w-5" />
          </IconButton>
        )}
        <IconButton aria-label="Search this conversation" active={searchOpen} onClick={() => setSearchOpen(v => !v)}>
          <Search className="h-5 w-5" />
        </IconButton>
        <IconButton aria-label="Encryption details" onClick={() => setSecurityOpen(true)}>
          <ShieldCheck className="h-5 w-5" />
        </IconButton>
      </header>

      {searchOpen && (
        <div className="border-b border-border/60 px-3 py-2.5 sm:px-4">
          <input
            aria-label="Search saved messages"
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved messages…"
            className="w-full rounded-full border border-border/70 bg-background/60 px-4 py-2.5 text-sm backdrop-blur transition-colors placeholder:text-secondary/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}

      {/* messages */}
      <div
        ref={scrollRef}
        data-testid="message-scroll"
        onScroll={e => {
          const el = e.currentTarget;
          nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          setAtBottom(nearBottom.current);
        }}
        className="locat-chat-canvas scroll-slim min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
      >
        {visibleMessages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="micro-label text-center normal-case leading-relaxed tracking-normal">
              {showHidden ? "No hidden messages match this view." : "No visible messages match this view."}
              <br />
              {showHidden ? "Hiding is local and does not lock messages." : "Everything you send is encrypted on this device first."}
            </p>
          </div>
        )}
        <div className="mx-auto max-w-3xl space-y-1.5">
          {visibleMessages.map((m, i) => {
            const prev = visibleMessages[i - 1];
            const showDay = !prev || !sameDay(prev.createdAt, m.createdAt);
            const showSender = conversation.type === "group" && !m.outgoing && (!prev || prev.senderId !== m.senderId || showDay);
            return (
              <div key={m.id}>
                {showDay && <DayDivider label={dayLabel(m.createdAt)} />}
                <MessageBubble
                  message={m}
                  showSender={showSender}
                  onReply={text => { setReply(text); textareaRef.current?.focus(); }}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleHidden={onToggleHidden}
                />
              </div>
            );
          })}
        </div>
      </div>

      {!atBottom && (
        <button
          type="button"
          className="smoked-glass mx-auto my-2 flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-transform active:scale-95"
          onClick={() => {
            const el = scrollRef.current;
            if (el) el.scrollTop = el.scrollHeight;
            setAtBottom(true);
          }}
        >
          <ArrowDown className="h-4 w-4" /> Latest messages
        </button>
      )}

      {reply && (
        <div className="flex items-center gap-3 border-t border-border/60 bg-card/50 px-4 py-2 text-sm backdrop-blur">
          <span className="bg-steel h-6 w-0.5 rounded-full" />
          <Reply className="text-steel h-4 w-4" />
          <p className="flex-1 truncate text-secondary">{reply}</p>
          <IconButton aria-label="Cancel reply" onClick={() => setReply(null)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      )}

      {/* composer */}
      <div className="smoked-glass pb-safe shrink-0 border-t border-border/60 px-3 py-3 sm:px-6" data-testid="composer">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (f) onSendImage(f);
            e.target.value = "";
          }} />
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (f) onSendFile(f);
            e.target.value = "";
          }} />
          <IconButton aria-label="Send file" title="Send file" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-5 w-5" />
          </IconButton>
          <IconButton aria-label="Send image" title="Send image" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus className="h-5 w-5" />
          </IconButton>
          <IconButton
            aria-label={recordingMs !== null ? "Stop and send voice message" : "Record voice message"}
            title="Voice message"
            onClick={toggleRecording}
            className={recordingMs !== null ? "text-destructive" : undefined}
          >
            {recordingMs !== null ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
          </IconButton>
          {recordingMs !== null ? (
            <div role="status" className="flex min-h-11 flex-1 items-center gap-2.5 rounded-full border border-destructive/40 bg-destructive/10 px-4 text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              Recording… {(recordingMs / 1000).toFixed(1)} / 60s
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              aria-label="Message"
              rows={1}
              maxLength={10000}
              value={draft}
              onChange={e => {
                setDraft(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 144)}px`;
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(min-width: 768px)").matches) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Message…"
              className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm outline-none backdrop-blur transition-colors placeholder:text-secondary/70 focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || recordingMs !== null}
            className="steel-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-30"
            aria-label="Send"
            title="Send"
            data-testid="send-button"
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Dialog open={securityOpen} onClose={() => setSecurityOpen(false)} title="Encryption details">
        <div className="space-y-3 text-sm text-secondary">
          <p className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="text-steel h-5 w-5" /> End-to-end encrypted
          </p>
          <p className="text-xs leading-relaxed">
            Messages for this conversation are encrypted on this device before they leave it.
            In this UI kit the transport is a mock adapter — after integration, key verification
            and rotation status surface here.
          </p>
          <div className="locat-control rounded-xl p-3">
            <p className="micro-label mb-1">Session fingerprint</p>
            <p className="font-mono-ui text-xs tracking-wider">LC-{conversation.id.slice(-4).toUpperCase()} ····· DEMO</p>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
