/** Auth screen — sign in and registration, titanium card on obsidian backdrop. */
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { LocatMark, LocatWordmark } from "../components/brand";
import { Button, Field, Input } from "../components/ui";

export function AuthScreen({
  onSignIn,
  onRegister,
}: {
  onSignIn: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, displayName: string, password: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim()) { setError("Enter a username."); return; }
    if (mode === "register") {
      if (!displayName.trim()) { setError("Enter a display name."); return; }
      if (password.length < 8) { setError("Use at least 8 characters for the password."); return; }
      if (password !== confirm) { setError("Passwords do not match."); return; }
    }
    if (!password) { setError("Enter your password."); return; }
    setPending(true);
    try {
      if (mode === "login") await onSignIn(username.trim(), password);
      else await onRegister(username.trim(), displayName.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="locat-auth-shell app-height flex items-center justify-center p-4" data-testid="auth-screen">
      <div className="w-full max-w-sm">
        <div className="fade-up mb-5 text-center">
          <div className="locat-icon-shell mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] border border-primary/15">
            <LocatMark className="h-full w-full rounded-[20px]" />
          </div>
          <h1><LocatWordmark className="text-3xl" /></h1>
          <p className="mt-2 text-xs text-secondary">Private conversations, kept close.</p>
        </div>

        <form onSubmit={e => void submit(e)} className="titanium-panel fade-up space-y-4 rounded-3xl p-6" style={{ animationDelay: "60ms" }}>
          <div>
            <p className="obsidian-kicker">Private workspace</p>
            <h2 className="mt-1 text-xl font-semibold">{mode === "login" ? "Welcome back" : "Create your private space"}</h2>
            <p className="mt-1 text-xs text-secondary">
              {mode === "login" ? "Sign in to continue your conversations." : "Your identity and messages stay protected."}
            </p>
          </div>

          <Field label="Username">
            <Input id="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} data-testid="auth-username" />
          </Field>
          {mode === "register" && (
            <Field label="Display name">
              <Input id="displayName" placeholder="How others see you" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </Field>
          )}
          <Field label="Password">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-12"
                data-testid="auth-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(v => !v)}
                className="locat-icon-button locat-control absolute inset-y-1 right-1 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          {mode === "register" && (
            <>
              <p className="text-xs leading-relaxed text-secondary">
                Use at least 8 characters. Avoid your username, common passwords and repeats.
              </p>
              <Field label="Confirm password">
                <Input id="password-confirm" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </Field>
            </>
          )}

          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

          <Button type="submit" variant="metal" disabled={pending} className="h-12 w-full" data-testid="auth-submit">
            {pending ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>

          <div className="locat-divider border-t pt-4 text-center">
            <button
              type="button"
              className="min-h-11 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => { setMode(m => (m === "login" ? "register" : "login")); setError(null); }}
            >
              {mode === "login" ? "New to Locat? Create account" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        <p className="micro-label mt-4 text-center normal-case tracking-normal">
          UI kit demo — the mock adapter accepts any username and password.
        </p>
      </div>
    </div>
  );
}
