import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone dev server for the UI kit. Port 3002 avoids clashes with the
// main Locat app (3001) and any Expo tooling (3000).
export default defineConfig({
  plugins: [react()],
  server: { port: 3002, host: true },
});
