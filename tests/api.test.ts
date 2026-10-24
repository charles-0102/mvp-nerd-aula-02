import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), createClient: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  mocks.createClient.mockReturnValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ data: {}, error: null });
});
it("rejects a malformed demand address with the same safe message as an inaccessible request", async () => {
  const { api } = await import("../src/api");
  await expect(api.get(false, "invalid")).rejects.toThrow(
    "NOT_FOUND_OR_DENIED",
  );
  await expect(api.comments(false, "invalid")).rejects.toThrow(
    "NOT_FOUND_OR_DENIED",
  );
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("keeps the participant access separate from persisted administrator authentication", async () => {
  const { rpc } = await import("../src/api");
  localStorage.setItem("central.participant.v1", "participant-credential");
  await rpc(false, "list_requests");
  await rpc(true, "list_requests");
  expect(mocks.createClient).toHaveBeenNthCalledWith(
    1,
    expect.any(String),
    expect.any(String),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  expect(mocks.createClient).toHaveBeenNthCalledWith(
    2,
    expect.any(String),
    expect.any(String),
    {
      auth: {
        storageKey: "central.admin.auth",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    },
  );
  expect(mocks.rpc).toHaveBeenNthCalledWith(
    1,
    "dinamica_nerd_aula_list_requests",
    { p_token: "participant-credential" },
  );
  expect(mocks.rpc).toHaveBeenNthCalledWith(
    2,
    "dinamica_nerd_aula_list_requests",
    {},
  );
});
it("clears the administrative view when the service rejects an expired JWT", async () => {
  const { rpc } = await import("../src/api");
  mocks.rpc.mockResolvedValue({
    data: null,
    error: { code: "PGRST301", message: "JWT expired" },
  });
  const lost = vi.fn();
  window.addEventListener("central:session-lost", lost);
  await expect(rpc(true, "list_requests")).rejects.toMatchObject({
    code: "PGRST301",
  });
  expect(lost).toHaveBeenCalledOnce();
  window.removeEventListener("central:session-lost", lost);
});
