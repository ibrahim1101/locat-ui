/** Message bubble with titanium/glass treatments, actions menu, and kind renderers. */
import { Copy, Download, MoreHorizontal, Play, Reply, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { timeLabel, voiceLabel } from "../lib/format";
import type { UiMessage } from "../types";
import { cn, Dialog } from "./ui";

export function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-3">
      <span className="micro-label rounded-full border border-border/60 bg-card/70 px-3.5 py-1 shadow-sm backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}

/** Presentational waveform + simulated progress (mock adapter ships no audio bytes). */
function VoiceBubble({ durationMs }: { durationMs: number }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);

  function toggle() {
    if (playing) {
      if (timer.current !== null) window.clearInterval(timer.current);
      setPlaying(false);
      return;
    }
    setPlaying(true);
    timer.current = window.setInterval(() => {
      setElapsed(prev => {
        if (prev + 250 >= durationMs) {
          if (timer.current !== null) window.clearInterval(timer.current);
          setPlaying(false);
          return 0;
        }
        return prev + 250;
      });
    }, 250);
  }

  const bars = [10, 16, 22, 14, 26, 18, 24, 12, 20, 16, 22, 10];
  return (
    <div className="flex min-w-48 items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className="steel-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      >
        <Play className={cn("h-4 w-4", playing && "animate-pulse")} />
      </button>
      <span className="flex flex-1 items-end gap-[3px]" aria-hidden="true">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn("w-[3px] rounded-full", playing ? "bg-steel" : "bg-secondary/60")}
            style={{ height: h, transition: "background-color 200ms" }}
          />
        ))}
      </span>
      <span className="micro-label">{voiceLabel(playing ? elapsed : durationMs)}</span>
    </div>
  );
}

export function MessageBubble({
  message,
  showSender,
  canControl = true,
  onReply,
  onEdit,
  onDelete,
  onToggleHidden,
  onRetry,
}: {
  message: UiMessage;
  showSender: boolean;
  canControl?: boolean;
  onReply: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  const [menu, setMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const mine = message.outgoing;

  return (
    <div className={cn("msg-in flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[78%] sm:max-w-[65%]", mine ? "items-end" : "items-start")}>
        {showSender && <p className="micro-label mb-1 ml-1 normal-case tracking-normal">{message.senderName}</p>}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            aria-label="Message actions"
            aria-expanded={menu}
            onClick={() => setMenu(v => !v)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-accent",
              menu ? "text-steel" : "text-secondary hover:text-foreground",
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        {menu && (
          <div className="smoked-glass sheet-in mb-2 flex flex-wrap gap-1 rounded-2xl p-2 text-xs">
            <button type="button" className="min-h-9 rounded-lg px-2.5 transition-colors hover:bg-accent" onClick={() => { onToggleHidden(message.id); setMenu(false); }}>
              {message.hidden ? "Restore message" : "Hide on this device"}
            </button>
            {message.kind === "text" && (
              <>
                <button
                  type="button"
                  className="flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 transition-colors hover:bg-accent"
                  onClick={() => { void navigator.clipboard?.writeText(message.text ?? "").catch(() => undefined); setMenu(false); }}
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  type="button"
                  className="flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 transition-colors hover:bg-accent"
                  onClick={() => { onReply(message.text ?? ""); setMenu(false); }}
                >
                  <Reply size={14} /> Reply
                </button>
              </>
            )}
            {canControl && mine && message.kind === "text" && !message.pending && (
              <button type="button" className="min-h-9 rounded-lg px-2.5 transition-colors hover:bg-accent" onClick={() => {
                const text = window.prompt("Edit message", message.text ?? "");
                if (text !== null && text.trim()) onEdit(message.id, text);
                setMenu(false);
              }}>
                Edit message
              </button>
            )}
            <button type="button" className="min-h-9 rounded-lg px-2.5 text-destructive transition-colors hover:bg-destructive/10" onClick={() => {
              if (window.confirm("Delete this message from this device?")) onDelete(message.id);
              setMenu(false);
            }}>
              Delete locally
            </button>
          </div>
        )}
        <div
          className={cn(
            "overflow-hidden rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            mine ? "bubble-out rounded-br-md text-foreground" : "bubble-in rounded-bl-md",
            message.pending && "opacity-60",
            message.failed && "border-destructive",
          )}
        >
          {message.kind === "image" && message.imageUrl && (
            <button type="button" onClick={() => setExpanded(true)} className="-mx-1 mb-1 block" aria-label={`Expand image ${message.imageAlt ?? ""}`}>
              <img src={message.imageUrl} alt={message.imageAlt ?? "Shared image"} className="max-h-72 rounded-lg object-cover" loading="lazy" />
            </button>
          )}
          {message.kind === "text" && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
          {message.kind === "file" && (
            <span className="flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-border/70 bg-background/40 px-3">
              <Download className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{message.fileName}</span>
                <span className="block text-xs opacity-75">{message.fileSizeKb ?? 1} KB · Download</span>
              </span>
            </span>
          )}
          {message.kind === "voice" && <VoiceBubble durationMs={message.voiceDurationMs ?? 1000} />}
          <div className={cn("mt-1 flex items-center gap-2", mine ? "justify-end" : "justify-start")}>
            {message.editedAt && <span className="text-[10px] text-secondary/80">edited</span>}
            <span className="micro-label opacity-80">{timeLabel(message.createdAt)}</span>
            {mine && !message.failed && (
              <span className={cn("text-[10px]", message.readBy.length ? "text-steel" : "text-secondary/80")}>
                {message.pending ? "Sending…" : message.readBy.length ? `Read${message.readBy.length > 1 ? ` by ${message.readBy.length}` : ""}` : "Sent"}
              </span>
            )}
            {message.failed && (
              <button type="button" onClick={() => onRetry?.(message.id)} className="flex items-center gap-1 text-xs text-destructive underline underline-offset-2">
                <RotateCcw className="h-3 w-3" /> retry
              </button>
            )}
          </div>
        </div>
      </div>
      {message.kind === "image" && message.imageUrl && (
        <Dialog open={expanded} onClose={() => setExpanded(false)} title={message.imageAlt ?? "Image"} wide>
          <img src={message.imageUrl} alt={message.imageAlt ?? "Shared image"} className="max-h-[70dvh] w-full rounded-xl object-contain" />
          <a className="locat-control mt-3 flex items-center justify-center gap-2 rounded-xl p-3 text-sm" href={message.imageUrl} download>
            <Download size={16} /> Download image
          </a>
        </Dialog>
      )}
    </div>
  );
}
