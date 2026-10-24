import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const forbidden = files.filter(
  (f) => /(^|\/)\.env($|\.)/.test(f) && !f.endsWith(".env.example"),
);
if (forbidden.length) throw Error("Real environment files are tracked.");
for (const file of files) {
  if (file === "scripts/check-secrets.mjs" || file === "package-lock.json")
    continue;
  const content = readFileSync(file, "utf8");
  if (
    /(?:sb_secret_[A-Za-z0-9_-]{10,}|gh[pousr]_[A-Za-z0-9]{25,}|sbp_[a-f0-9]{30,})/.test(
      content,
    )
  )
    throw Error("Credential-like value in " + file);
}
console.log("PASS tracked-file credential and environment checks");
