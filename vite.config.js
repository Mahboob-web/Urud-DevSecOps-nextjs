import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  // Target modern evergreen browsers only — this site doesn't need to
  // support anything old enough to require the legacy-JS fallback code
  // some dependencies ship for older engines.
  build: { target: "es2020" },
});
