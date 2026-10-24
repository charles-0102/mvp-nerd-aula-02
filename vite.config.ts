import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const allowed = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  // Vercel injects framework metadata into the build process. These names are
  // tolerated here but deliberately excluded from the browser's envPrefix.
  if (
    Object.keys(env).some(
      (key) => !allowed.includes(key) && !key.startsWith("VITE_VERCEL_"),
    )
  )
    throw Error(
      "Only the two documented public client variables may use VITE_.",
    );
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (key && !key.startsWith("sb_publishable_")) {
    let role = "";
    try {
      role = JSON.parse(
        Buffer.from(key.split(".")[1], "base64url").toString(),
      ).role;
    } catch {
      /* invalid key */
    }
    if (role !== "anon")
      throw Error("The browser requires a publishable or legacy anon key.");
  }
  return {
    plugins: [react()],
    envPrefix: allowed,
    server: {
      host: "127.0.0.1",
      strictPort: true,
      fs: {
        deny: [
          "**/.env*",
          "**/*.{crt,pem}",
          "**/.git/**",
          "**/artifacts/**",
          "**/supabase/**",
        ],
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: "supabase", test: /node_modules\/@supabase/ },
              {
                name: "react",
                test: /node_modules\/(react|react-dom|react-router|scheduler)/,
              },
            ],
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/**/*.test.{ts,tsx}"],
    },
  };
});
