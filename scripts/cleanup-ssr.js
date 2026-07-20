// Removes the temporary server-only bundle used just to prerender pages.
// It's Node-only code (react-dom/server output) and must never be uploaded
// to Hostinger — only the contents of dist/ get uploaded.
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

await rm(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log("Cleaned up dist-ssr/");
