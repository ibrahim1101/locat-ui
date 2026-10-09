/** Navigation drawer — smoked glass overlay with brand, nav, privacy card, profile, appearance. */
import { LayoutGrid, MessageSquare, MessageSquarePlus, Search, HardDrive, LogOut, X } from "lucide-react";
import type { Accent, ThemeMode } from "../theme/tokens";
import { accents } from "../theme/tokens";
import type { UserProfile } from "../types";
import { Avatar } from "./Avatar";
import { LocatMark, LocatWordmark } from "./brand";
import { PrivacyCard } from "./states";
import { cn, IconButton, Segmented } from "./ui";

const ACCENT_SWATCH: Record<Accent, string> = {
  titanium: "215 13% 82%", teal: "174 76% 48%", olive: "82 31% 60%",
  blue: "210 90% 68%", violet: "265 85% 75%", rose: "340 85% 73%",
};

export function Drawer({
  open,
  onClose,
  me,
  theme,
  accent,
  onThemeChange,
  onAccentChange,
  onOpenPeople,
  onOpenSettings,
  onOpenGallery,
  onSignOut,
  onFocusSearch,
}: {
  open: boolean;
  onClose: () => void;
  me: UserProfile;
  theme: ThemeMode;
  accent: Accent;
  onThemeChange: (theme: ThemeMode) => void;
  onAccentChange: (accent: Accent) => void;
  onOpenPeople: () => void;
  onOpenSettings: () => void;
  onOpenGallery: () => void;
  onSignOut: () => void;
  onFocusSearch: () => void;
}) {
  if (!open) return null;
  const item =
    "locat-control flex min-h-12 w-full items-center gap-3 rounded-xl border-transparent px-4 text-left text-sm";
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close navigation" onClick={onClose} className="fade-in absolute inset-0 bg-black/70" />
      <nav
        aria-label="Locat navigation"
        className="smoked-glass sheet-in pb-safe pt-safe relative flex h-full w-[min(86vw,340px)] flex-col rounded-r-3xl border-r px-4 shadow-2xl"
      >
        <div className="locat-divider flex min-h-20 items-center justify-between border-b px-2">
          <h2 className="flex items-center gap-2">
            <LocatMark className="h-9 w-9" />
            <LocatWordmark className="text-2xl" />
          </h2>
          <IconButton aria-label="Close navigation" onClick={onClose} className="locat-control locat-icon-button">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="mt-3 space-y-2">
          <button type="button" className={item} onClick={onClose}>
            <MessageSquare className="h-5 w-5" /> Chats
          </button>
          <button type="button" className={item} onClick={() => { onClose(); onFocusSearch(); }}>
            <Search className="h-5 w-5" /> Search conversations
          </button>
          <button type="button" className={item} onClick={() => { onClose(); onOpenPeople(); }} data-testid="drawer-people">
            <MessageSquarePlus className="h-5 w-5" /> People &amp; requests
          </button>
          <button type="button" className={item} onClick={() => { onClose(); onOpenSettings(); }}>
            <HardDrive className="h-5 w-5" /> Storage &amp; backups
          </button>
          <button type="button" className={item} onClick={() => { onClose(); onOpenGallery(); }}>
            <LayoutGrid className="h-5 w-5" /> Design gallery
          </button>
          <PrivacyCard />
        </div>

        <div className="mt-auto space-y-3">
          <div className="locat-divider border-t pt-3">
            <div className="locat-control flex items-center gap-3 rounded-xl border-transparent p-3">
              <Avatar user={me} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{me.displayName}</span>
                <span className="block truncate text-xs text-secondary">@{me.username} · {me.lcCode}</span>
              </span>
            </div>
          </div>
          <Segmented
            ariaLabel="Appearance mode"
            value={theme}
            onChange={onThemeChange}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <div className="flex items-center justify-center gap-2 pb-1" role="group" aria-label="Accent color">
            {accents.map(a => (
              <button
                key={a}
                type="button"
                aria-label={`${a} accent`}
                aria-pressed={accent === a}
                onClick={() => onAccentChange(a)}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-transform active:scale-90",
                  accent === a ? "border-foreground" : "border-transparent",
                )}
                style={{ background: `hsl(${ACCENT_SWATCH[a]})` }}
              />
            ))}
          </div>
          <button type="button" className={cn(item, "text-secondary")} onClick={onSignOut} data-testid="sign-out">
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </nav>
    </div>
  );
}
