/**
 * UI primitives styled with the Liquid Titanium tokens (src/index.css).
 * Dependency-free so they drop into the real Locat app unchanged.
 */
import { X } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useEffect } from "react";

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

// --- Button -------------------------------------------------------------------
type ButtonVariant = "metal" | "control" | "ghost" | "destructive";

export function Button({
  variant = "control",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const styles: Record<ButtonVariant, string> = {
    metal: "locat-metal-button rounded-xl font-semibold active:scale-[0.98]",
    control: "locat-control rounded-xl",
    ghost: "rounded-xl text-secondary transition-colors hover:bg-accent hover:text-foreground",
    destructive: "locat-control rounded-xl text-destructive hover:border-destructive/40",
  };
  return (
    <button
      type="button"
      className={cn("min-h-11 px-4 text-sm transition-all", styles[variant], className)}
      {...props}
    />
  );
}

export function IconButton({
  className = "",
  active = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:bg-accent active:scale-95",
        active ? "text-steel" : "text-secondary hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// --- Inputs ---------------------------------------------------------------------
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm backdrop-blur transition-colors",
        "placeholder:text-secondary/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm backdrop-blur transition-colors",
        "placeholder:text-secondary/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="micro-label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

// --- Surfaces ---------------------------------------------------------------------
export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={cn("titanium-panel rounded-2xl p-4", className)}>{children}</div>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-accent/70", className)} />;
}

// --- Segmented control (Chats / Hidden, Light / Dark, dialog tabs) -------------------
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="locat-control flex rounded-xl p-1" role="group" aria-label={ariaLabel}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "min-h-11 flex-1 rounded-lg px-3 text-sm transition-colors",
            value === option.value ? "bg-accent text-foreground" : "text-secondary hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// --- Dialog (centered modal) ---------------------------------------------------------
export function Dialog({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="fade-in absolute inset-0 bg-black/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "smoked-glass sheet-in relative w-full rounded-3xl p-5",
          wide ? "max-w-2xl" : "max-w-md",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold leading-none">{title}</h2>
          <IconButton aria-label="Close" onClick={onClose} className="h-9 w-9">
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Sheet (bottom sheet on phones, centered panel on larger screens) ------------------
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close panel" onClick={onClose} className="fade-in absolute inset-0 bg-black/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="smoked-glass sheet-in pb-safe relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl p-5 sm:max-w-md sm:rounded-3xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold leading-none">{title}</h2>
          <IconButton aria-label="Close" onClick={onClose} className="h-9 w-9">
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="scroll-slim min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
