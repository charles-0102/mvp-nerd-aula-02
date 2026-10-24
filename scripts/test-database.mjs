import pg from "pg";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { migrations, migrationSql } from "./database.mjs";
const { Client } = pg;
const p = "dinamica_nerd_aula_";
let directory;
let base;
const bin = process.env.PG_TEST_BIN ?? "/opt/homebrew/opt/postgresql@17/bin";
function command(name, args) {
  const result = spawnSync(`${bin}/${name}`, args, { encoding: "utf8" });
  if (result.status !== 0) throw Error(`${name} failed: ${result.stderr}`);
}
if (process.env.TEST_DATABASE_URL) {
  base = new URL(process.env.TEST_DATABASE_URL);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(base.hostname))
    throw Error("Disposable tests require a loopback database.");
} else {
  directory = mkdtempSync(join(tmpdir(), "central-db-test-"));
  command("initdb", [
    "-D",
    directory,
    "-A",
    "trust",
    "-U",
    "postgres",
    "--no-locale",
    "-E",
    "UTF8",
  ]);
  command("pg_ctl", [
    "-D",
    directory,
    "-l",
    join(directory, "server.log"),
    "-o",
    "-p 55439 -h 127.0.0.1",
    "-w",
    "start",
  ]);
  base = new URL("postgres://postgres@127.0.0.1:55439/postgres");
}
const dbName = `central_test_${randomUUID().replaceAll("-", "")}`;
const root = new Client({ connectionString: base.toString() });
let db;
const connections = [];
let checks = 0;
try {
  await root.connect();
  await root.query(`CREATE DATABASE ${dbName}`);
  const target = new URL(base);
  target.pathname = "/" + dbName;
  db = new Client({ connectionString: target.toString() });
  await db.connect();
  // Minimal Auth contract in an isolated database; no contact with shared Auth or production.
  await db.query(`DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,is_anonymous boolean DEFAULT false);
  CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),not_after timestamptz);
  CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (auth.jwt()->>'sub')::uuid $$;
  GRANT USAGE ON SCHEMA auth TO anon,authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;`);
  for (const [index, migration] of migrations().entries())
    await db.query(migrationSql(migration, index === 0));
  console.log("PASS migrations apply with hash registry");
  checks++;
  const adminId = randomUUID(),
    sessionId = randomUUID();
  await db.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,now());",
    [adminId, "admin@example.test"],
  );
  await db.query("INSERT INTO auth.sessions(id,user_id) VALUES($1,$2)", [
    sessionId,
    adminId,
  ]);
  const adminProfile = (
    await db.query(
      `INSERT INTO public.${p}profiles(auth_user_id,role,email,display_name) VALUES($1,'admin','admin@example.test','Instrutor') RETURNING *`,
      [adminId],
    )
  ).rows[0];
  async function actor(role, claims = {}) {
    const connection = new Client({ connectionString: target.toString() });
    await connection.connect();
    await connection.query(`SET ROLE ${role}`);
    await connection.query("SELECT set_config('request.jwt.claims',$1,false)", [
      JSON.stringify(claims),
    ]);
    connections.push(connection);
    return connection;
  }
  const anon = await actor("anon"),
    admin = await actor("authenticated", {
      sub: adminId,
      session_id: sessionId,
      is_anonymous: false,
    });
  const stranger = await actor("authenticated", {
    sub: randomUUID(),
    session_id: randomUUID(),
    is_anonymous: false,
  });
  const anonymousAdmin = await actor("authenticated", {
    sub: adminId,
    session_id: sessionId,
    is_anonymous: true,
  });
  const call = async (connection, name, args = []) =>
    (
      await connection.query(
        `SELECT * FROM public.${p}${name}(${args.map((_, i) => "$" + (i + 1)).join(",")})`,
        args,
      )
    ).rows;
  const scalar = async (connection, name, args = []) =>
    (await call(connection, name, args))[0][p + name];
  async function fail(promise, code) {
    await assert.rejects(promise, (e) => (code ? e.code === code : true));
    checks++;
  }
  async function test(name, fn) {
    await fn();
    console.log("PASS", name);
    checks++;
  }
  const register = (email) => scalar(anon, "register_participant", [email]);
  const a = await register("same@example.test"),
    b = await register("same@example.test"),
    fakeAdmin = await register("admin@example.test");
  const create = (
    token,
    priority = "medium",
    title = "Solicitar teclado e mouse",
    description = "Preciso de teclado e mouse para trabalhar.",
    reason = null,
    connection = anon,
  ) =>
    call(connection, "create_request", [
      title,
      description,
      priority,
      reason,
      token,
    ]).then((r) => r[0]);
  let r = await create(a.token);
  await test("separate participants with the same email; empty isolated list and counts", async () => {
    assert.notEqual(a.profile.id, b.profile.id);
    assert.equal((await call(anon, "list_requests", [b.token])).length, 0);
    assert.deepEqual(await scalar(anon, "counts", [b.token]), {
      open: 0,
      in_progress: 0,
      completed: 0,
    });
    assert.equal(r.status, "open");
    assert.equal(r.author_id, a.profile.id);
  });
  await test("email validation and public registration never grants administration", async () => {
    for (const email of [
      "",
      "   ",
      "abc",
      "a@b",
      "a b@c.d",
      "a".repeat(255) + "@e.test",
    ])
      await fail(register(email), "22023");
    assert.equal(fakeAdmin.profile.role, "requester");
    await fail(
      call(anon, "advance_status", [r.id, "in_progress", r.version]),
      "42501",
    );
    await fail(call(stranger, "current_profile", []), "42501");
    await fail(call(anonymousAdmin, "current_profile", []), "42501");
  });
  await test("isolation in detail, comments and writes; no direct table access", async () => {
    await fail(call(anon, "get_request", [r.id, b.token]), "42501");
    await fail(call(anon, "list_comments", [r.id, b.token]), "42501");
    await fail(
      call(anon, "add_comment", [r.id, "intrusion", b.token]),
      "42501",
    );
    for (const table of ["profiles", "requests", "comments"]) {
      await fail(anon.query(`SELECT * FROM public.${p}${table}`), "42501");
      assert.equal(
        (await stranger.query(`SELECT * FROM public.${p}${table}`)).rows.length,
        0,
      );
      await fail(admin.query(`DELETE FROM public.${p}${table}`), "42501");
    }
    await fail(
      anon.query(
        "SELECT * FROM dinamica_nerd_aula_private.participant_sessions",
      ),
      "42501",
    );
  });
  await test("title/description/priority and critical opening limits", async () => {
    for (const title of ["", " \t\n\u00a0", "x".repeat(121)])
      await fail(create(a.token, "medium", title), "22023");
    for (const description of ["", "\n", "x".repeat(2001)])
      await fail(create(a.token, "medium", "Title", description), "22023");
    for (const priority of [null, "other"])
      await fail(create(a.token, priority), "22023");
    for (const reason of ["", null, "\t\n", "x".repeat(1001)])
      await fail(
        create(a.token, "critical", "Title", "Description", reason),
        "22023",
      );
    for (const reason of ["x", "x".repeat(1000)]) {
      const critical = await create(
        a.token,
        "critical",
        "x".repeat(120),
        "x".repeat(2000),
        reason,
      );
      assert.equal(
        (await call(anon, "list_comments", [critical.id, a.token]))[0].body,
        reason,
      );
    }
  });
  await test("critical creation rollback if mandatory comment fails", async () => {
    const before = (await call(anon, "list_requests", [a.token])).length;
    await db.query(
      `CREATE FUNCTION public.test_reject_comment() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected isolated test failure'; END $$; CREATE TRIGGER test_fail BEFORE INSERT ON public.${p}comments FOR EACH ROW EXECUTE FUNCTION public.test_reject_comment();`,
    );
    await fail(
      create(a.token, "critical", "Rollback title", "Description", "Reason"),
      "P0001",
    );
    assert.equal((await call(anon, "list_requests", [a.token])).length, before);
    await db.query(`DROP TRIGGER test_fail ON public.${p}comments`);
  });
  await test("comments validation, reliable attribution and immutable decisions", async () => {
    for (const body of ["", " ", "x".repeat(1001)])
      await fail(call(anon, "add_comment", [r.id, body, a.token]), "22023");
    for (const body of [
      "x",
      "x".repeat(1000),
      "Prioridade revisada para Crítica",
    ]) {
      const c = (await call(anon, "add_comment", [r.id, body, a.token]))[0];
      assert.equal(c.kind, "comment");
      assert.equal(c.author_id, a.profile.id);
      assert.equal(c.previous_priority, null);
    }
    assert.equal(
      (await call(anon, "get_request", [r.id, a.token]))[0].priority,
      "medium",
    );
    await fail(
      anon.query(`UPDATE public.${p}requests SET title='forged' WHERE id=$1`, [
        r.id,
      ]),
      "42501",
    );
  });
  await test("atomic revision, no-op, validation and stale no-op rejection", async () => {
    for (const reason of ["", " ", "x".repeat(1001)])
      await fail(
        call(admin, "revise_priority", [r.id, "high", reason, 1, "medium"]),
        "22023",
      );
    const before = (await call(admin, "list_comments", [r.id])).length;
    await call(admin, "revise_priority", [r.id, "medium", "", 1, "medium"]);
    assert.equal((await call(admin, "list_comments", [r.id])).length, before);
    await db.query(
      `CREATE TRIGGER test_fail BEFORE INSERT ON public.${p}comments FOR EACH ROW EXECUTE FUNCTION public.test_reject_comment()`,
    );
    await fail(
      call(admin, "revise_priority", [r.id, "high", "Reason", 1, "medium"]),
      "P0001",
    );
    assert.equal(
      (await call(admin, "get_request", [r.id]))[0].priority,
      "medium",
    );
    assert.equal((await call(admin, "list_comments", [r.id])).length, before);
    await db.query(`DROP TRIGGER test_fail ON public.${p}comments`);
    r = (
      await call(admin, "revise_priority", [
        r.id,
        "high",
        "Sem itens disponíveis para trabalhar.",
        1,
        "medium",
      ])
    )[0];
    const comment = (await call(admin, "list_comments", [r.id])).at(-1);
    assert.equal(comment.kind, "priority_change");
    assert.equal(comment.author_id, adminProfile.id);
    assert.equal(comment.previous_priority, "medium");
    assert.equal(comment.new_priority, "high");
    await fail(
      call(admin, "revise_priority", [r.id, "high", "", 1, "medium"]),
      "PT409",
    );
    r = (
      await call(admin, "revise_priority", [
        r.id,
        "critical",
        "x".repeat(1000),
        r.version,
        r.priority,
      ])
    )[0];
    r = (
      await call(admin, "revise_priority", [
        r.id,
        "high",
        "x",
        r.version,
        r.priority,
      ])
    )[0];
    await fail(
      call(admin, "revise_priority", [r.id, "high", "", 2, "high"]),
      "PT409",
    );
  });
  await test("only valid status transitions; comments and own administrator requests", async () => {
    await fail(
      call(admin, "advance_status", [r.id, "completed", r.version]),
      "22023",
    );
    r = (
      await call(admin, "advance_status", [r.id, "in_progress", r.version])
    )[0];
    await fail(
      call(admin, "advance_status", [r.id, "open", r.version]),
      "22023",
    );
    await call(admin, "add_comment", [r.id, "Vou providenciar os itens."]);
    await call(anon, "add_comment", [r.id, "Obrigado.", a.token]);
    const own = await create(
      null,
      "critical",
      "Pedido do gestor",
      "Contexto",
      "Bloqueio",
      admin,
    );
    assert.equal(own.author_id, adminProfile.id);
    assert.equal(own.status, "open");
  });
  await test("row locks serialize revision and reject the losing concurrent version", async () => {
    const c2 = await actor("authenticated", {
      sub: adminId,
      session_id: sessionId,
    });
    const race = await create(a.token);
    await admin.query("BEGIN");
    await call(admin, "revise_priority", [
      race.id,
      "high",
      "first",
      1,
      "medium",
    ]);
    const pending = call(c2, "revise_priority", [
      race.id,
      "critical",
      "second",
      1,
      "medium",
    ]);
    const rejected = fail(pending, "PT409");
    await admin.query("COMMIT");
    await rejected;
    assert.equal(
      (await call(admin, "get_request", [race.id]))[0].priority,
      "high",
    );
  });
  await test("completion lock rejects a concurrent late comment; terminal read-only state", async () => {
    const c2 = await actor("anon");
    await admin.query("BEGIN");
    await call(admin, "advance_status", [r.id, "completed", r.version]);
    const pending = fail(
      call(c2, "add_comment", [r.id, "late", a.token]),
      "22023",
    );
    await admin.query("COMMIT");
    await pending;
    r = (await call(admin, "get_request", [r.id]))[0];
    await fail(
      call(admin, "revise_priority", [
        r.id,
        "medium",
        "reason",
        r.version,
        r.priority,
      ]),
      "22023",
    );
    await fail(
      call(admin, "advance_status", [r.id, "open", r.version]),
      "22023",
    );
    await fail(call(admin, "add_comment", [r.id, "after"]), "22023");
    assert.equal(
      (await call(anon, "get_request", [r.id, a.token]))[0].status,
      "completed",
    );
  });
  await test("revoked participant and terminated Auth session lose access", async () => {
    await db.query(
      `UPDATE dinamica_nerd_aula_private.participant_sessions SET revoked_at=now() WHERE profile_id=$1`,
      [b.profile.id],
    );
    await fail(call(anon, "current_profile", [b.token]), "42501");
    await db.query("DELETE FROM auth.sessions WHERE id=$1", [sessionId]);
    await fail(call(admin, "current_profile", []), "42501");
    assert.equal(
      (await admin.query(`SELECT * FROM public.${p}requests`)).rows.length,
      0,
    );
  });
  console.log(
    `Database verification passed: ${checks} assertions/groups; disposable database removed on exit.`,
  );
  if (process.env.CENTRAL_WRITE_TEST_REPORT === "1")
    writeFileSync(
      "artifacts/database-test-result.json",
      JSON.stringify(
        { date: new Date().toISOString(), passed: true, checks },
        null,
        2,
      ),
    );
} finally {
  await Promise.all(connections.map((c) => c.end()));
  if (db) await db.end();
  try {
    await root.query(`DROP DATABASE ${dbName}`);
  } finally {
    await root.end();
  }
  if (directory) {
    command("pg_ctl", ["-D", directory, "-m", "fast", "-w", "stop"]);
    rmSync(directory, { recursive: true, force: true });
  }
}
