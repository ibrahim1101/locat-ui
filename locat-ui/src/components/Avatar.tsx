/** Identicon avatars tinted by the user's stable hue, with the steel online dot. */
import type { UserProfile } from "../types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  user,
  size = 40,
  showPresence = false,
}: {
  user: UserProfile;
  size?: number;
  showPresence?: boolean;
}) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full font-medium uppercase"
        style={{
          backgroundColor: `hsl(${user.avatarHue} 45% 16%)`,
          color: `hsl(${user.avatarHue} 80% 72%)`,
          fontSize: size * 0.34,
        }}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          initials(user.displayName)
        )}
      </span>
      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-background ${user.online ? "bg-steel" : "bg-[hsl(0_0%_26%)]"}`}
          style={{ width: Math.max(10, size * 0.28), height: Math.max(10, size * 0.28) }}
        />
      )}
    </span>
  );
}

/** Overlapping avatar stack used for group conversations. */
export function AvatarStack({ members, size = 38 }: { members: UserProfile[]; size?: number }) {
  const shown = members.slice(0, 3);
  return (
    <span className="relative flex shrink-0" style={{ width: size + (shown.length - 1) * 12, height: size }}>
      {shown.map((member, i) => (
        <span
          key={member.id}
          className="absolute rounded-full ring-2 ring-background"
          style={{ left: i * 12, zIndex: shown.length - i }}
        >
          <Avatar user={member} size={size} />
        </span>
      ))}
    </span>
  );
}
