import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { configuration } from "./environment.mjs";
import { verifyTarget, savePrivate } from "./database.mjs";
verifyTarget();
const config = configuration([
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PROJECT_REF",
]);
if (!config.VITE_SUPABASE_URL.includes(config.SUPABASE_PROJECT_REF))
  throw Error("Public URL target mismatch");
const client = createClient(
  config.VITE_SUPABASE_URL,
  config.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const run = randomUUID();
const profiles = [];
const requests = [];
const call = async (name, args = {}) => {
  const { data, error } = await client.rpc("dinamica_nerd_aula_" + name, args);
  if (error)
    throw Error("Public RPC failed: " + name + " (" + error.code + ")");
  return data;
};
const save = () =>
  savePrivate("artifacts/remote-smoke-fixtures.json", {
    run,
    date: new Date().toISOString(),
    profileIds: profiles,
    requestIds: requests,
    cleanup:
      "Retained; only these IDs are eligible for cleanup after explicit operator action.",
  });
try {
  for (let i = 0; i < 2; i++) {
    const participant = await call("register_participant", {
      p_email: `central-qa-${run}@example.test`,
    });
    profiles.push(participant.profile.id);
    save();
    const access = { p_token: participant.token };
    assert.deepEqual(await call("counts", access), {
      open: 0,
      in_progress: 0,
      completed: 0,
    });
    assert.equal((await call("list_requests", access)).length, 0);
    if (i === 0) {
      const demand = await call("create_request", {
        ...access,
        p_title: "[QA] Integração da Central",
        p_description:
          "Registro identificado de verificação local com Supabase real.",
        p_priority: "critical",
        p_reason:
          "Verificar a persistência conjunta da abertura e de sua justificativa.",
      });
      requests.push(demand.id);
      save();
      assert.equal(demand.author_id, participant.profile.id);
      assert.equal(demand.status, "open");
      assert.match(demand.number, /^DEM-[A-F0-9]{8}$/);
      assert.equal(
        (await call("list_comments", { ...access, p_request_id: demand.id }))
          .length,
        1,
      );
      await call("add_comment", {
        ...access,
        p_request_id: demand.id,
        p_body: "Persistência pelo cliente público verificada.",
      });
      assert.equal(
        (await call("list_comments", { ...access, p_request_id: demand.id }))
          .length,
        2,
      );
      assert.equal(
        (await call("get_request", { ...access, p_request_id: demand.id }))
          .priority,
        "critical",
      );
    }
  }
  savePrivate("artifacts/remote-smoke-result.json", {
    date: new Date().toISOString(),
    passed: true,
    checks: [
      "public registration",
      "same email separate registrations",
      "empty second list and counts",
      "critical opening + comment",
      "comment persistence",
      "detail persistence",
    ],
    adminAuth: "Requires actual admin login in local browser",
  });
  console.log(
    "PASS public-key integration on verified Supabase: registration, separate same-email access, critical opening, comments, counts and persistence. Fixtures recorded privately.",
  );
} catch (e) {
  save();
  throw e;
}
