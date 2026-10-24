import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Comment, Counts, Demand, Profile } from "./domain";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key && !key.startsWith("sb_secret_"));
// Separate clients keep public routes independent from an administrator's JWT.
let publicClient: SupabaseClient | undefined;
let adminClient: SupabaseClient | undefined;
export function client(admin: boolean) {
  if (!configured) throw new Error("CONFIGURATION_MISSING");
  if (admin)
    return (adminClient ??= createClient(url, key, {
      auth: {
        storageKey: "central.admin.auth",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }));
  return (publicClient ??= createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }));
}
const tokenKey = "central.participant.v1";
export function storedToken() {
  try {
    return localStorage.getItem(tokenKey);
  } catch {
    return null;
  }
}
export function forgetToken() {
  try {
    localStorage.removeItem(tokenKey);
  } catch {
    /* already unavailable */
  }
}
export async function register(email: string) {
  try {
    localStorage.setItem("central.storage-check", "ok");
    localStorage.removeItem("central.storage-check");
  } catch {
    throw Error("STORAGE_UNAVAILABLE");
  }
  const result = await rpc<{ token: string; profile: Profile }>(
    false,
    "register_participant",
    { p_email: email.trim() },
    false,
  );
  try {
    localStorage.setItem(tokenKey, result.token);
  } catch {
    throw Error("STORAGE_UNAVAILABLE");
  }
  return result.profile;
}
export async function rpc<T>(
  admin: boolean,
  name: string,
  args: Record<string, unknown> = {},
  withToken = true,
): Promise<T> {
  const payload =
    !admin && withToken ? { ...args, p_token: storedToken() } : args;
  const { data, error } = await client(admin).rpc(
    `dinamica_nerd_aula_${name}`,
    payload,
  );
  if (error) {
    if (
      error.message === "SESSION_REQUIRED" ||
      (admin && ["PGRST301", "PGRST302", "PGRST303"].includes(error.code))
    )
      window.dispatchEvent(
        new CustomEvent("central:session-lost", { detail: { admin } }),
      );
    throw error;
  }
  return data as T;
}
async function allPages<T>(admin: boolean, name: string, args = {}) {
  const result: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = await rpc<T[]>(admin, name, { ...args, p_offset: offset });
    result.push(...page);
    if (page.length < 500) return result;
  }
}
export const api = {
  profile: (admin: boolean) => rpc<Profile>(admin, "current_profile"),
  list: (admin: boolean) => allPages<Demand>(admin, "list_requests"),
  counts: (admin: boolean) => rpc<Counts>(admin, "counts"),
  get: (admin: boolean, id: string) =>
    rpc<Demand>(admin, "get_request", { p_request_id: id }),
  comments: (admin: boolean, id: string) =>
    allPages<Comment>(admin, "list_comments", { p_request_id: id }),
};
