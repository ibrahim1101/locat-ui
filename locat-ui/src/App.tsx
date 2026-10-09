/**
 * App shell — route state (auth → chats → gallery) and appearance context.
 *
 * The shell exists to demonstrate the screens standalone. During integration,
 * replace it with the real Locat router and pass a tRPC-backed adapter:
 *   <App adapter={myTrpcAdapter} />
 * See docs/LOCAT_INTEGRATION.md.
 */
import { useEffect, useMemo, useState } from "react";
import type { LocatUiAdapter } from "./adapter";
import { MockLocatAdapter } from "./mock/adapter";
import { AuthScreen } from "./screens/AuthScreen";
import { ChatsScreen } from "./screens/ChatsScreen";
import { GalleryScreen } from "./screens/GalleryScreen";
import { applyAppearance, type Accent, type ThemeMode } from "./theme/tokens";
import type { UserProfile } from "./types";

type Route = "auth" | "chats" | "gallery";

export default function App({ adapter: injected }: { adapter?: LocatUiAdapter }) {
  // MOCK: the kit boots with MockLocatAdapter. Inject the real adapter here.
  const adapter = useMemo<LocatUiAdapter>(() => injected ?? new MockLocatAdapter(), [injected]);
  const [route, setRoute] = useState<Route>("auth");
  const [me, setMe] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem("locat-ui-theme") as ThemeMode) || "dark");
  const [accent, setAccent] = useState<Accent>(() => (localStorage.getItem("locat-ui-accent") as Accent) || "titanium");

  useEffect(() => {
    applyAppearance(theme, accent);
    localStorage.setItem("locat-ui-theme", theme);
    localStorage.setItem("locat-ui-accent", accent);
  }, [theme, accent]);

  if (route === "gallery" && me) {
    return <GalleryScreen onBack={() => setRoute("chats")} />;
  }

  if (route === "chats" && me) {
    return (
      <ChatsScreen
        adapter={adapter}
        me={me}
        theme={theme}
        accent={accent}
        onThemeChange={setTheme}
        onAccentChange={setAccent}
        onOpenGallery={() => setRoute("gallery")}
        onSignOut={() => { void adapter.signOut(); setMe(null); setRoute("auth"); }}
      />
    );
  }

  return (
    <AuthScreen
      onSignIn={async (username, password) => { setMe(await adapter.signIn(username, password)); setRoute("chats"); }}
      onRegister={async (username, displayName, password) => { setMe(await adapter.register({ username, displayName, password })); setRoute("chats"); }}
    />
  );
}
