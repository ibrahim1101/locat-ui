/** Profile dialog (user bio card) and group details dialog. */
import { Fingerprint, MessageSquare } from "lucide-react";
import type { ConversationSummary, UserProfile } from "../types";
import { Avatar } from "./Avatar";
import { Button, Dialog } from "./ui";

export function ProfileDialog({
  user,
  onClose,
  onMessage,
}: {
  user: UserProfile | null;
  onClose: () => void;
  onMessage: (user: UserProfile) => void;
}) {
  if (!user) return null;
  return (
    <Dialog open onClose={onClose} title="Profile">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar user={user} size={84} showPresence />
        <div>
          <p className="text-lg font-semibold">{user.displayName}</p>
          <p className="micro-label">@{user.username}</p>
        </div>
        <span className="locat-control flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs">
          <Fingerprint className="text-steel h-4 w-4" /> {user.lcCode}
        </span>
        <p className="max-w-72 text-sm leading-relaxed text-secondary">{user.bio}</p>
        <p className={`micro-label normal-case tracking-normal ${user.online ? "text-steel" : ""}`}>
          {user.online ? "online now" : "last seen recently"}
        </p>
        <Button variant="metal" className="mt-1 w-full" onClick={() => { onMessage(user); onClose(); }} data-testid="profile-message">
          <MessageSquare className="mr-2 h-4 w-4" /> Message
        </Button>
      </div>
    </Dialog>
  );
}

export function GroupDialog({
  conversation,
  meId,
  onClose,
  onOpenProfile,
}: {
  conversation: ConversationSummary | null;
  meId: string;
  onClose: () => void;
  onOpenProfile: (user: UserProfile) => void;
}) {
  if (!conversation) return null;
  return (
    <Dialog open onClose={onClose} title={conversation.name ?? "Group"}>
      <p className="micro-label mb-3">{conversation.members.length} members</p>
      <div className="space-y-2">
        {conversation.members.map(member => (
          <button
            key={member.id}
            type="button"
            onClick={() => member.id !== meId && onOpenProfile(member)}
            className="locat-control flex w-full items-center gap-3 rounded-2xl border-transparent p-2.5 text-left"
          >
            <Avatar user={member} size={40} showPresence />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {member.displayName}{member.id === meId ? " (you)" : ""}
              </span>
              <span className="micro-label block truncate">@{member.username}</span>
            </span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
