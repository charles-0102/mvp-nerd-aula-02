import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = mkdtempSync(join(tmpdir(), "central-build-env-"));
const env = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("VITE_")),
);
const publicUrl = "https://build-fixture.example.test";
const publicKey = "sb_publishable_build_fixture";
const metadata = "vercel_metadata_must_not_reach_browser";
const privateValue = "private_value_must_not_reach_browser";
const source = `import { build } from ${JSON.stringify(import.meta.resolve("vite"))};
await build({ configFile: ${JSON.stringify(resolve(root, "vite.config.ts"))},
  root: process.cwd(), envDir: false, logLevel: "silent" });`;
function compile(extra = {}) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", source], {
    cwd: fixture,
    env: {
      ...env,
      VITE_SUPABASE_URL: publicUrl,
      VITE_SUPABASE_PUBLISHABLE_KEY: publicKey,
      VITE_VERCEL_ENV: "production",
      VITE_VERCEL_URL: metadata,
      VITE_VERCEL_GIT_COMMIT_SHA: metadata,
      VITE_VERCEL_FUTURE_METADATA: metadata,
      SUPABASE_ACCESS_TOKEN: privateValue,
      ...extra,
    },
    encoding: "utf8",
    timeout: 60_000,
  });
}
function assertRejected(extra, message) {
  const result = compile(extra);
  assert.notEqual(result.status, 0, "Unsafe build configuration was accepted");
  assert.ok(result.stderr.includes(message), "Expected validation did not run");
}
function legacyKey(role) {
  return `fixture.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.fixture`;
}
try {
  writeFileSync(join(fixture, "index.html"), '<script type="module" src="/main.js"></script>');
  writeFileSync(join(fixture, "main.js"), "document.body.textContent = JSON.stringify(import.meta.env);");
  const result = compile();
  assert.equal(result.status, 0, "Build failed with Vercel framework metadata");
  const assets = join(fixture, "dist/assets");
  const bundle = readdirSync(assets)
    .filter((name) => name.endsWith(".js"))
    .map((name) => readFileSync(join(assets, name), "utf8"))
    .join("\n");
  assert.ok(bundle.includes(publicUrl) && bundle.includes(publicKey));
  assert.ok(!bundle.includes(metadata) && !bundle.includes(privateValue));
  assert.ok(!bundle.includes("VITE_VERCEL_") && !bundle.includes("SUPABASE_ACCESS_TOKEN"));
  assertRejected({ VITE_UNEXPECTED_SECRET: privateValue }, "Only the two documented");
  assertRejected({ VITE_SUPABASE_URL_SECRET: privateValue }, "Only the two documented");
  assertRejected({ VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_test" }, "requires a publishable");
  assertRejected({ VITE_SUPABASE_PUBLISHABLE_KEY: legacyKey("service_role") }, "requires a publishable");
  assert.equal(compile({ VITE_SUPABASE_PUBLISHABLE_KEY: legacyKey("anon") }).status, 0);
  console.log("PASS 6 build scenarios: Vercel metadata accepted, browser exposure restricted, unexpected variables and privileged keys rejected, legacy anon accepted.");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
