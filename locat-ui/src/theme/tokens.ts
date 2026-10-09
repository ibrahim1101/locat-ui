/**
 * TypeScript mirror of the Liquid Titanium + Smoked Glass design tokens.
 * Values are identical to src/index.css — keep both in sync. The CSS file is
 * the source of truth for styling; this module exists for programmatic use
 * (charts, canvas, avatar tints, meta theme-color, etc.).
 */
export const tokens = {
  background: "#0A0B0D",
  secondary: "#111317",
  elevated: "#17191D",
  glass: "#202329",
  border: "#343840",
  text: "#F1F3F5",
  muted: "#9DA4AF",
  titanium: "#D3D8DF",
  steel: "#8FB6D6",
} as const;

export const accents = ["titanium", "teal", "olive", "blue", "violet", "rose"] as const;
export type Accent = (typeof accents)[number];

export type ThemeMode = "dark" | "light";

/** Apply theme + accent exactly like the main Locat app (data attributes on <html>). */
export function applyAppearance(theme: ThemeMode, accent: Accent) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  if (accent === "titanium") delete root.dataset.accent;
  else root.dataset.accent = accent;
}
