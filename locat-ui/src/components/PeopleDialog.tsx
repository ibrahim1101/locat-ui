/** People & conversations dialog: Friends, People discovery, Requests, Group creation. */
import { MessageSquare, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserProfile } from "../types";
import { Avatar } from "./Avatar";
import { Button, Dialog, Input, cn } from "./ui";

type Tab = "friends" | "people" | "requests" | "group";

export function PeopleDialog({
  open,
  onClose,
  friends,
  requests,
  onSearchPeople,
  onSendRequest,
  onAccept,
  onDecline,
  onRemove,
  onMessage,
  onCreateGroup,
}: {
  open: boolean;
  onClose: () => void;
  friends: UserProfile[];
  requests: UserProfile[];
  /** Mock-friendly async search — wire to the adapter's searchPeople. */
  onSearchPeople: (query: string) => Promise<UserProfile[]>;
  onSendRequest: (userId: string) => Promise<void>;
  onAccept: (userId: string) => Promise<void>;
  onDecline: (userId: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onMessage: (user: UserProfile) => void;
  onCreateGroup: (name: string, memberIds: string[]) => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>("friends");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (tab !== "people") return;
    const q = query.trim();
    if (!q) { setResults([]); return; }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void onSearchPeople(q).then(r => { if (!cancelled) setResults(r); });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(handle); };
  }, [tab, query, onSearchPeople]);

  const friendFilter = friends.filter(p =>
    !query.trim() || p.displayName.toLowerCase().includes(query.toLowerCase()) || p.username.includes(query.toLowerCase()),
  );

  function PersonRow({ person, actions }: { person: UserProfile; actions: React.ReactNode }) {
    return (
      <div className="locat-control flex items-center gap-3 rounded-2xl border-transparent p-2.5">
        <Avatar user={person} size={40} showPresence />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{person.displayName}</span>
          <span className="micro-label block truncate">@{person.username} · {person.lcCode}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">{actions}</span>
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="People and conversations" wide>
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-xl border border-border/70 bg-background p-1" role="tablist" aria-label="Conversation options">
        {(["friends", "people", "requests", "group"] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => { setTab(t); setQuery(""); }}
            className={cn(
              "min-h-11 rounded-lg px-2 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-accent text-foreground" : "text-secondary hover:text-foreground",
            )}
          >
            {t === "requests" ? `Requests${requests.length ? ` (${requests.length})` : ""}` : t}
          </button>
        ))}
      </div>

      <div className="scroll-slim max-h-[min(55vh,28rem)] space-y-2 overflow-y-auto pr-1">
        {tab === "friends" && (
          <>
            <Input aria-label="Search your accepted friends" placeholder="Search your accepted friends…" value={query} onChange={e => setQuery(e.target.value)} />
            <p className="micro-label pt-1">Your contacts</p>
            {friendFilter.length === 0 && <p className="px-2 py-4 text-sm text-secondary">No friends yet. Open People to find someone and send a request.</p>}
            {friendFilter.map(person => (
              <PersonRow key={person.id} person={person} actions={
                <>
                  <Button variant="metal" className="min-h-9 px-3 text-xs" onClick={() => { onMessage(person); onClose(); }}>Chat</Button>
                  <Button variant="ghost" className="min-h-9 px-2 text-xs" aria-label={`Remove ${person.displayName}`} onClick={() => void onRemove(person.id)}>
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </>
              } />
            ))}
          </>
        )}

        {tab === "people" && (
          <>
            <Input aria-label="Find people" placeholder="Name, username or LC-1234…" value={query} onChange={e => setQuery(e.target.value)} autoFocus />
            {query.trim() === "" && <p className="px-2 py-4 text-sm text-secondary">Search by display name, username, or Locat code.</p>}
            {query.trim() !== "" && results.length === 0 && <p className="px-2 py-4 text-sm text-secondary">Nobody matches “{query}”.</p>}
            {results.map(person => (
              <PersonRow key={person.id} person={person} actions={
                requested.has(person.id) ? (
                  <span className="micro-label px-2">Requested</span>
                ) : (
                  <Button variant="metal" className="min-h-9 px-3 text-xs" onClick={() => { void onSendRequest(person.id); setRequested(s => new Set(s).add(person.id)); }}>
                    <UserPlus className="mr-1 h-3.5 w-3.5" /> Add
                  </Button>
                )
              } />
            ))}
          </>
        )}

        {tab === "requests" && (
          <>
            {requests.length === 0 && <p className="px-2 py-4 text-sm text-secondary">No pending requests.</p>}
            {requests.map(person => (
              <PersonRow key={person.id} person={person} actions={
                <>
                  <Button variant="metal" className="min-h-9 px-3 text-xs" onClick={() => void onAccept(person.id)}>Accept</Button>
                  <Button variant="destructive" className="min-h-9 px-3 text-xs" onClick={() => void onDecline(person.id)}>Decline</Button>
                </>
              } />
            ))}
          </>
        )}

        {tab === "group" && (
          <div className="space-y-3">
            <Input aria-label="Group name" placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} />
            <p className="micro-label">Members</p>
            {friends.map(person => (
              <button
                key={person.id}
                type="button"
                aria-pressed={picked.has(person.id)}
                onClick={() => setPicked(s => { const next = new Set(s); if (next.has(person.id)) next.delete(person.id); else next.add(person.id); return next; })}
                className={cn("locat-control flex w-full items-center gap-3 rounded-2xl border-transparent p-2.5 text-left", picked.has(person.id) && "border-[hsl(var(--steel)/0.5)]")}
              >
                <Avatar user={person} size={36} />
                <span className="flex-1 truncate text-sm">{person.displayName}</span>
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border text-[10px]", picked.has(person.id) ? "bg-steel border-transparent text-background" : "border-border text-transparent")}>✓</span>
              </button>
            ))}
            <Button
              variant="metal"
              className="w-full"
              disabled={picked.size === 0}
              onClick={() => { void onCreateGroup(groupName, [...picked]).then(() => { setGroupName(""); setPicked(new Set()); onClose(); }); }}
              data-testid="create-group"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Create group ({picked.size})
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
