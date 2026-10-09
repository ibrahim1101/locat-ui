/**
 * Design gallery — every token, primitive, state and overlay on one screen.
 * Exists for design review and integration verification; not part of the
 * product navigation in the real app.
 */
import { ArrowLeft, MessageSquareDashed } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { DayDivider, MessageBubble } from "../components/MessageBubble";
import { LocatMark, LocatWordmark } from "../components/brand";
import { ChatListSkeleton, EmptyState, ErrorState, MessageSkeleton, OfflineBanner, PrivacyCard, Spinner } from "../components/states";
import { Button, Card, Dialog, Field, IconButton, Input, Segmented, Sheet, Skeleton, Textarea } from "../components/ui";
import type { UiMessage, UserProfile } from "../types";

const GALLERY_USER: UserProfile = {
  id: "gallery-user",
  username: "ava",
  displayName: "Ava Sterling",
  bio: "Design systems and quiet interfaces.",
  lcCode: "LC-2214",
  avatarHue: 210,
  online: true,
};

const GALLERY_MESSAGES: UiMessage[] = [
  { id: "g1", conversationId: "gallery", senderId: "ava", senderName: "Ava Sterling", kind: "text", text: "Incoming messages arrive in smoked glass.", createdAt: Date.now() - 120_000, outgoing: false, readBy: [] },
  { id: "g2", conversationId: "gallery", senderId: "me", senderName: "You", kind: "text", text: "Outgoing messages carry the brushed titanium gradient with the steel read receipt.", createdAt: Date.now() - 60_000, outgoing: true, readBy: ["ava"] },
  { id: "g3", conversationId: "gallery", senderId: "me", senderName: "You", kind: "voice", voiceDurationMs: 23_000, createdAt: Date.now() - 30_000, outgoing: true, readBy: [] },
];

export function GalleryScreen({ onBack }: { onBack: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seg, setSeg] = useState<"a" | "b">("a");

  return (
    <div className="app-height scroll-slim overflow-y-auto" data-testid="gallery-screen">
      <header className="smoked-glass pt-safe sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <IconButton aria-label="Back to chats" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <h1 className="text-sm font-semibold">Design gallery</h1>
        <span className="micro-label">Liquid Titanium + Smoked Glass</span>
      </header>

      <div className="mx-auto max-w-3xl space-y-10 p-4 pb-16 sm:p-6">
        <section className="space-y-3">
          <p className="obsidian-kicker">Brand</p>
          <Card className="flex items-center gap-4">
            <div className="locat-icon-shell flex h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] border border-primary/15">
              <LocatMark className="h-full w-full rounded-[20px]" />
            </div>
            <div>
              <LocatWordmark className="text-3xl" />
              <p className="mt-1 text-xs text-secondary">Private conversations, kept close.</p>
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">Buttons</p>
          <Card className="flex flex-wrap items-center gap-3">
            <Button variant="metal">Metal primary</Button>
            <Button variant="control">Control</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="metal" disabled>Disabled</Button>
            <IconButton aria-label="Sample icon button"><MessageSquareDashed className="h-5 w-5" /></IconButton>
            <button type="button" className="steel-button flex h-11 w-11 items-center justify-center rounded-full" aria-label="Steel send button">
              <MessageSquareDashed className="h-5 w-5" />
            </button>
          </Card>
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">Inputs</p>
          <Card className="space-y-3">
            <Field label="Username"><Input placeholder="username" /></Field>
            <Field label="Bio"><Textarea rows={2} placeholder="A short bio…" /></Field>
            <Segmented ariaLabel="Demo segmented" value={seg} onChange={setSeg} options={[{ value: "a", label: "First" }, { value: "b", label: "Second" }]} />
          </Card>
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">Avatars &amp; presence</p>
          <Card className="flex items-center gap-4">
            <Avatar user={GALLERY_USER} size={56} showPresence />
            <Avatar user={{ ...GALLERY_USER, id: "g2", displayName: "Noah Reyes", avatarHue: 152, online: false }} size={56} showPresence />
            <Avatar user={{ ...GALLERY_USER, id: "g3", displayName: "Mira Chen", avatarHue: 268 }} size={56} />
          </Card>
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">Messages</p>
          <Card className="space-y-1.5">
            <DayDivider label="Today" />
            {GALLERY_MESSAGES.map(m => (
              <MessageBubble key={m.id} message={m} showSender={false} onReply={() => undefined} onEdit={() => undefined} onDelete={() => undefined} onToggleHidden={() => undefined} />
            ))}
          </Card>
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">States</p>
          <Card className="flex items-center gap-4">
            <Spinner /> <span className="text-sm text-secondary">Spinner</span>
            <Skeleton className="h-4 w-24" /> <span className="text-sm text-secondary">Skeleton</span>
          </Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card><ChatListSkeleton /></Card>
            <Card><MessageSkeleton /></Card>
            <Card className="min-h-48"><EmptyState title="Nothing here yet" hint="Empty states stay quiet and centred." /></Card>
            <Card className="min-h-48"><ErrorState error="The relay could not be reached." onRetry={() => undefined} /></Card>
          </div>
          <Card className="p-0 overflow-hidden"><OfflineBanner visible /></Card>
          <PrivacyCard />
        </section>

        <section className="space-y-3">
          <p className="obsidian-kicker">Overlays</p>
          <Card className="flex flex-wrap gap-3">
            <Button variant="control" onClick={() => setDialogOpen(true)} data-testid="gallery-open-dialog">Open dialog</Button>
            <Button variant="control" onClick={() => setSheetOpen(true)} data-testid="gallery-open-sheet">Open bottom sheet</Button>
          </Card>
        </section>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Sample dialog">
        <p className="text-sm text-secondary">Smoked glass dialog with backdrop, Escape to close, and a focus-safe close control.</p>
        <Button variant="metal" className="mt-4 w-full" onClick={() => setDialogOpen(false)}>Done</Button>
      </Dialog>
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Sample bottom sheet">
        <p className="text-sm text-secondary">Bottom sheet on phones, centered panel on larger screens. Scrollable content, safe-area padding.</p>
        <Button variant="metal" className="mt-4 w-full" onClick={() => setSheetOpen(false)}>Done</Button>
      </Sheet>
    </div>
  );
}
