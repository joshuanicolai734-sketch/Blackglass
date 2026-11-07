import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

// Own-account hosting (studio/handoffs/2026-11-07-leaving-chatgpt/, docs/HOSTING.md). These come from the environment
// at build time, so the repository holds no account ids. Unset, the build behaves as before.
const ownAccount = {
  databaseName: process.env.D1_DATABASE_NAME || "site-creator-d1",
  databaseId: process.env.D1_DATABASE_ID || SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
  accessTeamDomain: process.env.CF_ACCESS_TEAM_DOMAIN || "",
  accessAud: process.env.CF_ACCESS_AUD || "",
};

const localBindingConfig = {
  name: "blackglass",
  // Movement Studio clips go to the Worker first, so it can answer byte ranges with 206 (worker/index.ts).
  main: "./worker/index.ts",
  assets: { binding: "ASSETS", run_worker_first: ["/movements/*.mp4"] },
  compatibility_flags: ["nodejs_compat"],
  vars: { CF_ACCESS_TEAM_DOMAIN: ownAccount.accessTeamDomain, CF_ACCESS_AUD: ownAccount.accessAud },
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: ownAccount.databaseName,
          database_id: ownAccount.databaseId,
          // Relative to the generated dist/server/wrangler.json, for `wrangler d1 migrations apply`.
          migrations_dir: "../../drizzle",
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Use Miniflare's local Request.cf placeholder unless fetching is requested.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      ...(managedLinux ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] } : {}),
      ...(isCodexSeatbeltSandbox ? { watch: { useFsEvents: false, usePolling: true } } : {}),
    },
    plugins: [
      vinext(),
      sites({ mockAuth: !managedLinux }),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
