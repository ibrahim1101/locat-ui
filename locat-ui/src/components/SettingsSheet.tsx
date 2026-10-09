/** Settings sheet — profile edit, appearance, storage, about. Bottom sheet on phones. */
import { HardDrive, LayoutGrid } from "lucide-react";
import { useState } from "react";
import type { Accent, ThemeMode } from "../theme/tokens";
import { accents } from "../theme/tokens";
import type { UserProfile } from "../types";
import { Avatar } from "./Avatar";
import { PrivacyCard } from "./states";
import { Button, Field, Input, Segmented, Sheet, Textarea, cn } from "./ui";

const ACCENT_SWATCH: Record<Accent, string> = {
  titanium: "215 13% 82%", teal: "174 76% 48%", olive: "82 31% 60%",
  blue: "210 90% 68%", violet: "265 85% 75%", rose: "340 85% 73%",
};

export function SettingsSheet({
  open,
  onClose,
  me,
  theme,
  accent,
  onThemeChange,
  onAccentChange,
  onSaveProfile,
  onOpenGallery,
}: {
  open: boolean;
  onClose: () => void;
  me: UserProfile;
  theme: ThemeMode;
  accent: Accent;
  onThemeChange: (theme: ThemeMode) => void;
  onAccentChange: (accent: Accent) => void;
  onSaveProfile: (patch: { displayName: string; bio: string }) => Promise<void>;
  onOpenGallery: () => void;
}) {
  const [displayName, setDisplayName] = useState(me.displayName);
  const [bio, setBio] = useState(me.bio);
  const [saved, setSaved] = useState(false);

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <div className="space-y-6 pb-2">
        <section className="space-y-3">
          <p className="obsidian-kicker">Profile</p>
          <div className="flex items-center gap-3">
            <Avatar user={me} size={52} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{me.displayName}</p>
              <p className="micro-label truncate">@{me.username} · {me.lcCode}</p>
            </div>
          </div>
          <Field label="Display name">
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={60} data-testid="settings-display-name" />
          </Field>
          <Field label="Bio">
            <Textarea rows={2} value={bio} onChange={e => setBio(e.target.value)} maxLength={160} />
          </Field>
          <div className="flex items-center gap-3">
            <Button
              variant="metal"
              onClick={() => { void onSaveProfile({ displayName: displayName.trim() || me.displayName, bio: bio.trim() }).then(() => { setSaved(true); window.setTimeout(() => setSaved(false), 1600); }); }}
              data-testid="settings-save"
            >
              Save changes
            </Button>
            {saved && <span role="status" className="text-steel text-xs">Saved</span>}
          </div>
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">Appearance</p>
          <Segmented
            ariaLabel="Appearance mode"
            value={theme}
            onChange={onThemeChange}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <div className="flex items-center gap-2" role="group" aria-label="Accent color">
            {accents.map(a => (
              <button
                key={a}
                type="button"
                aria-label={`${a} accent`}
                aria-pressed={accent === a}
                onClick={() => onAccentChange(a)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform active:scale-90",
                  accent === a ? "border-foreground" : "border-transparent",
                )}
                style={{ background: `hsl(${ACCENT_SWATCH[a]})` }}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">Storage &amp; backups</p>
          <div className="locat-control flex items-center gap-3 rounded-2xl border-transparent p-3.5">
            <HardDrive className="h-5 w-5 shrink-0 text-secondary" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Local encrypted store</span>
              <span className="block text-xs text-secondary">History stays in this browser. Folder backup is wired during integration.</span>
            </span>
          </div>
          <PrivacyCard />
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">About</p>
          <Button variant="control" className="flex w-full items-center gap-2" onClick={() => { onClose(); onOpenGallery(); }}>
            <LayoutGrid className="h-4 w-4" /> Open design gallery
          </Button>
          <p className="micro-label text-center normal-case tracking-normal">
            Locat UI kit · v1.0.0 · mock adapter · Liquid Titanium build
          </p>
        </section>
      </div>
    </Sheet>
  );
}
