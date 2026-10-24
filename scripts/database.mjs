import { configuration } from "./environment.mjs";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  chmodSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
export const prefix = "dinamica_nerd_aula_";
export const privateSchema = "dinamica_nerd_aula_private";
export const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const migrations = () =>
  readdirSync("supabase/migrations")
    .filter((f) => /^\d{14}_[a-z_]+\.sql$/.test(f))
    .sort()
    .map((name) => ({
      name,
      sql: readFileSync(`supabase/migrations/${name}`, "utf8"),
      sha256: hash(readFileSync(`supabase/migrations/${name}`)),
    }));
export function migrationSql(migration, first) {
  const body = migration.sql
    .replace(/^BEGIN;\s*$/im, "")
    .replace(/^COMMIT;\s*$/im, "");
  return `BEGIN;\n${body}\n${first ? `CREATE TABLE ${privateSchema}.applied_migrations (name text PRIMARY KEY, sha256 text NOT NULL CHECK(length(sha256)=64), applied_at timestamptz NOT NULL DEFAULT now()); ALTER TABLE ${privateSchema}.applied_migrations ENABLE ROW LEVEL SECURITY; REVOKE ALL ON ${privateSchema}.applied_migrations FROM PUBLIC,anon,authenticated,service_role;` : ""}\nINSERT INTO ${privateSchema}.applied_migrations(name,sha256) VALUES (${literal(migration.name)},${literal(migration.sha256)});\nCOMMIT;`;
}
export function unwrap(value, key) {
  if (!value || typeof value !== "object") return null;
  if (Object.hasOwn(value, key))
    return typeof value[key] === "string" ? JSON.parse(value[key]) : value[key];
  for (const child of Object.values(value)) {
    const found = unwrap(child, key);
    if (found !== null) return found;
  }
  return null;
}
export function savePrivate(path, content) {
  mkdirSync("artifacts", { recursive: true });
  writeFileSync(
    path,
    typeof content === "string" ? content : JSON.stringify(content, null, 2),
    { mode: 0o600 },
  );
  chmodSync(path, 0o600);
}
export function runCli(args) {
  const result = spawnSync("supabase", args, {
    encoding: "utf8",
    timeout: 60000,
  });
  if (result.status !== 0) {
    savePrivate("artifacts/cli-diagnostic.json", {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    });
    throw Error(
      "Supabase CLI failed. Inspect protected artifacts/cli-diagnostic.json before retrying.",
    );
  }
  return JSON.parse(result.stdout);
}
export function verifyTarget() {
  const config = configuration([
    "SUPABASE_PROJECT_NAME",
    "SUPABASE_PROJECT_REF",
    "SUPABASE_DATABASE_PREFIX",
    "SUPABASE_PRIVATE_SCHEMA",
  ]);
  if (
    config.SUPABASE_DATABASE_PREFIX !== prefix ||
    config.SUPABASE_PRIVATE_SCHEMA !== privateSchema
  )
    throw Error("Configured scope differs from reviewed migrations.");
  if (!config.SUPABASE_PROJECT_NAME || !config.SUPABASE_PROJECT_REF)
    throw Error("Project identification missing.");
  if (
    !existsSync("supabase/.temp/project-ref") ||
    readFileSync("supabase/.temp/project-ref", "utf8").trim() !==
      config.SUPABASE_PROJECT_REF
  )
    throw Error("Link the configured project before continuing.");
  const data = runCli(["projects", "list", "--output", "json"]);
  const projects = Array.isArray(data) ? data : (data.data ?? data.projects);
  if (
    !projects.some(
      (p) =>
        (p.id ?? p.ref) === config.SUPABASE_PROJECT_REF &&
        p.name === config.SUPABASE_PROJECT_NAME,
    )
  )
    throw Error("Authorized Supabase project not confirmed.");
  return config;
}
export function query(sql, label = "query") {
  const path = `artifacts/${label}.sql`;
  savePrivate(path, sql);
  const data = runCli([
    "db",
    "query",
    "--linked",
    "--file",
    path,
    "--output",
    "json",
  ]);
  savePrivate(`artifacts/${label}.json`, data);
  return data;
}
const metadataSql = `SELECT jsonb_build_object(
 'tables',(SELECT coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,'rls',c.relrowsecurity,'acl',c.relacl::text) ORDER BY n.nspname,c.relname),'[]'::jsonb) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND (n.nspname='${privateSchema}' OR (n.nspname='public' AND starts_with(c.relname,'${prefix}')))),
 'functions',(SELECT coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'security_definer',p.prosecdef,'settings',p.proconfig,'acl',p.proacl::text,'definition',pg_get_functiondef(p.oid)) ORDER BY n.nspname,p.proname),'[]'::jsonb) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='${privateSchema}' OR (n.nspname='public' AND starts_with(p.proname,'${prefix}'))),
 'columns',(SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY table_schema,table_name,ordinal_position),'[]'::jsonb) FROM information_schema.columns c WHERE table_schema='${privateSchema}' OR (table_schema='public' AND starts_with(table_name,'${prefix}'))),
 'constraints',(SELECT coalesce(jsonb_agg(jsonb_build_object('name',c.conname,'definition',pg_get_constraintdef(c.oid)) ORDER BY c.conname),'[]'::jsonb) FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='${privateSchema}' OR (n.nspname='public' AND starts_with(c.conname,'${prefix}'))),
 'policies',(SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY schemaname,tablename,policyname),'[]'::jsonb) FROM pg_policies p WHERE schemaname='${privateSchema}' OR (schemaname='public' AND starts_with(tablename,'${prefix}'))),
 'external_metadata_digest',(SELECT md5(coalesce(string_agg(item,E'\\n' ORDER BY item),'')) FROM (
 SELECT to_jsonb(p)::text AS item FROM pg_policies p WHERE schemaname<>'${privateSchema}' AND NOT starts_with(tablename,'${prefix}')
 UNION ALL SELECT pg_get_triggerdef(t.oid) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE NOT t.tgisinternal AND n.nspname<>'${privateSchema}' AND NOT starts_with(c.relname,'${prefix}')
 UNION ALL SELECT coalesce(c.relacl::text,'') || n.nspname || c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('public','auth') AND NOT starts_with(c.relname,'${prefix}')
 ) external_objects),
 'registry',to_regclass('${privateSchema}.applied_migrations') IS NOT NULL,
 'private_schema',to_regnamespace('${privateSchema}') IS NOT NULL
 ) AS report;`;
export function preflight() {
  const data = unwrap(query(metadataSql, "preflight"), "report");
  if (!data) throw Error("Unrecognized preflight response.");
  return data;
}
export async function main(action) {
  verifyTarget();
  const before = preflight();
  console.log(
    "Target verified. App tables:",
    before.tables.length,
    "App functions:",
    before.functions.length,
    "Registry:",
    before.registry,
  );
  if (action === "preflight") return;
  if (action === "apply") {
    if (
      !before.registry &&
      (before.private_schema || before.tables.length || before.functions.length)
    )
      throw Error(
        "Untracked existing objects: inspect compatibility; automatic recreation refused.",
      );
    const applied = before.registry
      ? unwrap(
          query(
            `SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]'::jsonb) AS migrations FROM ${privateSchema}.applied_migrations m;`,
            "applied-migrations",
          ),
          "migrations",
        )
      : [];
    const files = migrations();
    if (
      applied.some(
        (entry) =>
          !files.some(
            (file) => file.name === entry.name && file.sha256 === entry.sha256,
          ),
      )
    )
      throw Error("Migration history/hash differs. Stop and inspect.");
    for (const migration of files) {
      if (applied.some((entry) => entry.name === migration.name)) {
        console.log("Verified, skipped:", migration.name);
        continue;
      }
      const first = !before.registry && migration.name === files[0].name;
      // Persist intent before sending; a timeout must be resolved against the registry before retrying.
      savePrivate("artifacts/migration-intent.json", {
        name: migration.name,
        sha256: migration.sha256,
        started: new Date().toISOString(),
      });
      query(migrationSql(migration, first), "migration-execution");
      console.log("Applied:", migration.name, "SHA-256:", migration.sha256);
    }
    const after = preflight();
    const verified = unwrap(
      query(
        `SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]'::jsonb) AS migrations FROM ${privateSchema}.applied_migrations m;`,
        "verified-migrations",
      ),
      "migrations",
    );
    if (
      verified.length !== files.length ||
      !files.every((file) =>
        verified.some(
          (entry) => entry.name === file.name && entry.sha256 === file.sha256,
        ),
      ) ||
      !after.tables.every((table) => table.rls)
    )
      throw Error("Post-migration history or RLS verification failed.");
    if (after.external_metadata_digest !== before.external_metadata_digest)
      throw Error(
        "Other application metadata changed during operation. Inspect before continuing.",
      );
    savePrivate("artifacts/migration-verification.json", {
      date: new Date().toISOString(),
      migrations: files.map(({ name, sha256 }) => ({ name, sha256 })),
      tables: after.tables.length,
      functions: after.functions.length,
      external_metadata_unchanged: true,
    });
    console.log(
      "Migrations verified; other application policy, trigger and privilege metadata unchanged.",
    );
  } else if (action === "provision") {
    if (!before.registry) throw Error("Apply and verify migrations first.");
    const c = configuration(["ADMIN_EMAIL", "ADMIN_DISPLAY_NAME"]);
    if (!c.ADMIN_EMAIL || !c.ADMIN_DISPLAY_NAME)
      throw Error("Admin configuration missing.");
    const sql = `BEGIN; DO $provision$ DECLARE target uuid; existing public.${prefix}profiles; BEGIN
 SELECT id INTO STRICT target FROM auth.users WHERE lower(email)=lower(${literal(c.ADMIN_EMAIL)}) AND email_confirmed_at IS NOT NULL AND coalesce(is_anonymous,false)=false;
 SELECT * INTO existing FROM public.${prefix}profiles WHERE auth_user_id=target;
 IF FOUND THEN IF existing.role<>'admin' OR existing.email<>${literal(c.ADMIN_EMAIL)} OR existing.display_name<>${literal(c.ADMIN_DISPLAY_NAME)} THEN RAISE EXCEPTION 'Existing profile differs; manual review required'; END IF;
 ELSE INSERT INTO public.${prefix}profiles(auth_user_id,role,email,display_name) VALUES(target,'admin',${literal(c.ADMIN_EMAIL)},${literal(c.ADMIN_DISPLAY_NAME)}); END IF;
 END $provision$; COMMIT; SELECT jsonb_build_object('admin_profile_verified',true) AS result;`;
    query(sql, "provision-admin");
    console.log(
      "Admin profile linked to the existing confirmed account; Auth unchanged.",
    );
  } else throw Error("Use preflight, apply or provision.");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main(process.argv[2] ?? "preflight").catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
