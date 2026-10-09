/** Loading, empty, error and offline surfaces used across screens. */
import { CloudOff, MessageSquareDashed, RotateCcw, ShieldCheck, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Skeleton } from "./ui";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary ${className}`}
    />
  );
}

/** Skeleton rows matching the conversation list anatomy. */
export function ChatListSkeleton() {
  return (
    <div className="space-y-2 p-3" aria-label="Loading conversations">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 rounded-2xl p-2.5">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton bubbles matching the conversation anatomy. */
export function MessageSkeleton() {
  return (
    <div className="space-y-3 p-4" aria-label="Loading messages">
      <div className="flex justify-start"><Skeleton className="h-12 w-2/5 rounded-2xl rounded-bl-md" /></div>
      <div className="flex justify-end"><Skeleton className="h-16 w-1/2 rounded-2xl rounded-br-md" /></div>
      <div className="flex justify-start"><Skeleton className="h-10 w-1/3 rounded-2xl rounded-bl-md" /></div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="locat-icon-shell flex h-14 w-14 items-center justify-center rounded-2xl text-secondary">
        {icon ?? <MessageSquareDashed className="h-6 w-6" />}
      </span>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="micro-label max-w-64 normal-case leading-relaxed tracking-normal">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  error,
  onRetry,
}: {
  title?: string;
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center" role="alert">
      <span className="locat-icon-shell flex h-14 w-14 items-center justify-center rounded-2xl text-destructive">
        <CloudOff className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {error && <p className="max-w-72 text-xs leading-relaxed text-secondary">{error}</p>}
      {onRetry && (
        <Button variant="control" onClick={onRetry} className="mt-1 flex items-center gap-2">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  );
}

/** Slim banner pinned to the top of the chat shell while offline. */
export function OfflineBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div role="status" className="fade-in flex items-center justify-center gap-2 border-b border-border/60 bg-card/80 px-3 py-1.5 text-xs text-secondary backdrop-blur">
      <WifiOff className="h-3.5 w-3.5" />
      Offline — messages will send when you reconnect.
    </div>
  );
}

/** Compact privacy assurance card (drawer / settings). */
export function PrivacyCard() {
  return (
    <div className="locat-control flex items-start gap-3 rounded-2xl border-transparent p-3.5">
      <span className="locat-icon-shell flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-steel">
        <ShieldCheck className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-medium">Protected on this device</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-secondary">
          Messages are encrypted before delivery and saved history stays on this device.
        </span>
      </span>
    </div>
  );
}
