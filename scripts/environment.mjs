import { parse } from "dotenv";
import { existsSync, readFileSync, chmodSync } from "node:fs";
export function configuration(keys) {
  const base = existsSync(".env") ? parse(readFileSync(".env")) : {};
  if (existsSync(".env")) chmodSync(".env", 0o600);
  const overlay = existsSync(".env.local")
    ? parse(readFileSync(".env.local"))
    : {};
  const config = {};
  for (const key of keys) {
    const candidates = [base[key], overlay[key], process.env[key]].filter(
      (v) => v !== undefined && v !== "",
    );
    if (new Set(candidates).size > 1)
      throw new Error(`Conflicting configuration: ${key}`);
    config[key] = candidates[0] ?? "";
  }
  return config;
}
