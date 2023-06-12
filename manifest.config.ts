import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";
const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = "0"] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: env.mode === "staging" ? "[INTERNAL] Just Read It" : "Just Read It",
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  permissions: ["contextMenus"],
  icons: {
    "16": "src/assets/images/icon-16.png",
    "48": "src/assets/images/icon-48.png",
  },
  background: {
    type: "module",
    service_worker: "src/background/index.ts",
  },
  content_scripts: [
    {
      js: ["src/content/index.tsx"],
      matches: ["https://*/*"],
    },
  ],
}));
