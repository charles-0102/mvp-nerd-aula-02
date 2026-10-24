-- Recreates the preserved application structure only. No user records or Auth changes.

BEGIN;

SET LOCAL lock_timeout = '5s';

SET LOCAL statement_timeout = '30s';

SET LOCAL search_path = pg_catalog, public;

SET LOCAL check_function_bodies = off;

CREATE SCHEMA "dinamica_nerd_aula_private" AUTHORIZATION "postgres";

CREATE TABLE "dinamica_nerd_aula_private"."participant_sessions" (
  "token_hash" text NOT NULL,
  "profile_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revoked_at" timestamp with time zone
);

ALTER TABLE "dinamica_nerd_aula_private"."participant_sessions" OWNER TO "postgres";

CREATE TABLE "public"."dinamica_nerd_aula_comments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "request_id" uuid NOT NULL,
  "author_id" uuid NOT NULL,
  "author_label" text NOT NULL,
  "body" text NOT NULL,
  "kind" text NOT NULL,
  "previous_priority" text,
  "new_priority" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "public"."dinamica_nerd_aula_comments" OWNER TO "postgres";

CREATE TABLE "public"."dinamica_nerd_aula_profiles" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "auth_user_id" uuid,
  "role" text NOT NULL,
  "email" text NOT NULL,
  "display_name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "public"."dinamica_nerd_aula_profiles" OWNER TO "postgres";

CREATE TABLE "public"."dinamica_nerd_aula_requests" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "number" text DEFAULT ('DEM-'::text || upper(substr(replace((gen_random_uuid())::text, '-'::text, ''::text), 1, 8))) NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "author_id" uuid NOT NULL,
  "author_label" text NOT NULL,
  "status" text DEFAULT 'open'::text NOT NULL,
  "priority" text NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "public"."dinamica_nerd_aula_requests" OWNER TO "postgres";

ALTER TABLE "dinamica_nerd_aula_private"."participant_sessions" ADD CONSTRAINT "participant_sessions_pkey" PRIMARY KEY (token_hash);

ALTER TABLE "public"."dinamica_nerd_aula_comments" ADD CONSTRAINT "dinamica_nerd_aula_comments_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ADD CONSTRAINT "dinamica_nerd_aula_profiles_pkey" PRIMARY KEY (id);

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_pkey" PRIMARY KEY (id);

ALTER TABLE "dinamica_nerd_aula_private"."participant_sessions" ADD CONSTRAINT "participant_sessions_profile_id_key" UNIQUE (profile_id);

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ADD CONSTRAINT "dinamica_nerd_aula_profiles_auth_user_id_key" UNIQUE (auth_user_id);

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_number_key" UNIQUE (number);

ALTER TABLE "dinamica_nerd_aula_private"."participant_sessions" ADD CONSTRAINT "participant_sessions_token_hash_check" CHECK ((length(token_hash) = 64));

ALTER TABLE "public"."dinamica_nerd_aula_comments" ADD CONSTRAINT "dinamica_nerd_aula_comments_body_check" CHECK (((length(btrim(body)) >= 1) AND (length(btrim(body)) <= 1000)));

ALTER TABLE "public"."dinamica_nerd_aula_comments" ADD CONSTRAINT "dinamica_nerd_aula_comments_check" CHECK ((((kind <> 'priority_change'::text) AND (previous_priority IS NULL) AND (new_priority IS NULL)) OR ((kind = 'priority_change'::text) AND (previous_priority IS NOT NULL) AND (new_priority IS NOT NULL) AND (previous_priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])) AND (new_priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])) AND (previous_priority <> new_priority))));

ALTER TABLE "public"."dinamica_nerd_aula_comments" ADD CONSTRAINT "dinamica_nerd_aula_comments_kind_check" CHECK ((kind = ANY (ARRAY['comment'::text, 'critical_opening'::text, 'priority_change'::text])));

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ADD CONSTRAINT "dinamica_nerd_aula_profiles_check" CHECK ((((role = 'admin'::text) AND (auth_user_id IS NOT NULL)) OR ((role = 'requester'::text) AND (auth_user_id IS NULL))));

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ADD CONSTRAINT "dinamica_nerd_aula_profiles_display_name_check" CHECK (((length(btrim(display_name)) >= 1) AND (length(btrim(display_name)) <= 254)));

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ADD CONSTRAINT "dinamica_nerd_aula_profiles_email_check" CHECK (((length(email) <= 254) AND (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'::text)));

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ADD CONSTRAINT "dinamica_nerd_aula_profiles_role_check" CHECK ((role = ANY (ARRAY['requester'::text, 'admin'::text])));

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_description_check" CHECK (((length(btrim(description)) >= 1) AND (length(btrim(description)) <= 2000)));

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])));

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'completed'::text])));

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_title_check" CHECK (((length(btrim(title)) >= 1) AND (length(btrim(title)) <= 120)));

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_version_check" CHECK ((version > 0));

ALTER TABLE "dinamica_nerd_aula_private"."participant_sessions" ADD CONSTRAINT "participant_sessions_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES dinamica_nerd_aula_profiles(id);

ALTER TABLE "public"."dinamica_nerd_aula_comments" ADD CONSTRAINT "dinamica_nerd_aula_comments_author_id_fkey" FOREIGN KEY (author_id) REFERENCES dinamica_nerd_aula_profiles(id);

ALTER TABLE "public"."dinamica_nerd_aula_comments" ADD CONSTRAINT "dinamica_nerd_aula_comments_request_id_fkey" FOREIGN KEY (request_id) REFERENCES dinamica_nerd_aula_requests(id);

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ADD CONSTRAINT "dinamica_nerd_aula_profiles_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."dinamica_nerd_aula_requests" ADD CONSTRAINT "dinamica_nerd_aula_requests_author_id_fkey" FOREIGN KEY (author_id) REFERENCES dinamica_nerd_aula_profiles(id);

CREATE INDEX dinamica_nerd_aula_comments_request_idx ON public.dinamica_nerd_aula_comments USING btree (request_id, created_at);

CREATE INDEX dinamica_nerd_aula_requests_author_idx ON public.dinamica_nerd_aula_requests USING btree (author_id, created_at DESC);

CREATE FUNCTION dinamica_nerd_aula_private.active_uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select s.user_id from auth.sessions s where s.id::text=(select auth.jwt()->>'session_id')
    and s.user_id=(select auth.uid()) and (s.not_after is null or s.not_after>now()) limit 1;
$function$;

ALTER FUNCTION "dinamica_nerd_aula_private"."active_uid"() OWNER TO "postgres";

CREATE FUNCTION dinamica_nerd_aula_private.actor(p_token text DEFAULT NULL::text)
 RETURNS dinamica_nerd_aula_profiles
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p public.dinamica_nerd_aula_profiles;
begin
  if dinamica_nerd_aula_private.is_admin() then
    select * into p from public.dinamica_nerd_aula_profiles where auth_user_id=dinamica_nerd_aula_private.active_uid();
    return p;
  end if;
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'SESSION_REQUIRED' using errcode='42501'; end if;
  select profile.* into p from dinamica_nerd_aula_private.participant_sessions s
    join public.dinamica_nerd_aula_profiles profile on profile.id=s.profile_id
    where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and s.revoked_at is null and profile.role='requester';
  if not found then raise exception 'SESSION_REQUIRED' using errcode='42501'; end if;
  return p;
end;
$function$;

ALTER FUNCTION "dinamica_nerd_aula_private"."actor"(p_token text) OWNER TO "postgres";

CREATE FUNCTION dinamica_nerd_aula_private.clean_text(value text, maximum integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare cleaned text := btrim(value,E' \t\n\r\f\v' || U&'\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
begin
  if cleaned is null or length(cleaned) not between 1 and maximum then raise exception 'INVALID_TEXT' using errcode='22023'; end if;
  return cleaned;
end;
$function$;

ALTER FUNCTION "dinamica_nerd_aula_private"."clean_text"(value text, maximum integer) OWNER TO "postgres";

CREATE FUNCTION dinamica_nerd_aula_private.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from public.dinamica_nerd_aula_profiles p
    where p.auth_user_id=dinamica_nerd_aula_private.active_uid() and p.role='admin'
      and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false);
$function$;

ALTER FUNCTION "dinamica_nerd_aula_private"."is_admin"() OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_add_comment(p_request_id uuid, p_body text, p_token text DEFAULT NULL::text)
 RETURNS dinamica_nerd_aula_comments
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor public.dinamica_nerd_aula_profiles := dinamica_nerd_aula_private.actor(p_token); r public.dinamica_nerd_aula_requests; c public.dinamica_nerd_aula_comments;
begin
  select * into r from public.dinamica_nerd_aula_requests where id=p_request_id for update;
  if not found or (r.author_id<>actor.id and actor.role<>'admin') then raise exception 'NOT_FOUND_OR_DENIED' using errcode='42501'; end if;
  if r.status='completed' then raise exception 'REQUEST_COMPLETED' using errcode='22023'; end if;
  insert into public.dinamica_nerd_aula_comments(request_id,author_id,author_label,body,kind)
    values(r.id,actor.id,actor.display_name,dinamica_nerd_aula_private.clean_text(p_body,1000),'comment') returning * into c;
  return c;
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_add_comment"(p_request_id uuid, p_body text, p_token text) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_advance_status(p_request_id uuid, p_next_status text, p_expected_version integer)
 RETURNS dinamica_nerd_aula_requests
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor public.dinamica_nerd_aula_profiles := dinamica_nerd_aula_private.actor(); r public.dinamica_nerd_aula_requests;
begin
  if actor.role<>'admin' then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  select * into r from public.dinamica_nerd_aula_requests where id=p_request_id for update;
  if not found then raise exception 'NOT_FOUND_OR_DENIED' using errcode='42501'; end if;
  if r.version is distinct from p_expected_version then raise exception 'STALE_REQUEST' using errcode='PT409'; end if;
  if p_next_status is null or not ((r.status='open' and p_next_status='in_progress') or (r.status='in_progress' and p_next_status='completed')) then
    raise exception 'INVALID_TRANSITION' using errcode='22023';
  end if;
  update public.dinamica_nerd_aula_requests set status=p_next_status,version=version+1 where id=r.id returning * into r;
  return r;
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_advance_status"(p_request_id uuid, p_next_status text, p_expected_version integer) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_counts(p_token text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor public.dinamica_nerd_aula_profiles := dinamica_nerd_aula_private.actor(p_token);
begin
  return (select jsonb_build_object('open',count(*) filter(where status='open'), 'in_progress',count(*) filter(where status='in_progress'),
    'completed',count(*) filter(where status='completed')) from public.dinamica_nerd_aula_requests where actor.role='admin' or author_id=actor.id);
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_counts"(p_token text) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_create_request(p_title text, p_description text, p_priority text, p_reason text DEFAULT NULL::text, p_token text DEFAULT NULL::text)
 RETURNS dinamica_nerd_aula_requests
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor public.dinamica_nerd_aula_profiles := dinamica_nerd_aula_private.actor(p_token); r public.dinamica_nerd_aula_requests; reason text;
begin
  if p_priority is null or p_priority not in ('low','medium','high','critical') then raise exception 'INVALID_PRIORITY' using errcode='22023'; end if;
  if p_priority='critical' then reason:=dinamica_nerd_aula_private.clean_text(p_reason,1000); end if;
  loop
    insert into public.dinamica_nerd_aula_requests(title,description,priority,author_id,author_label)
    values(dinamica_nerd_aula_private.clean_text(p_title,120),dinamica_nerd_aula_private.clean_text(p_description,2000),p_priority,actor.id,actor.display_name)
    on conflict (number) do nothing returning * into r;
    exit when found;
  end loop;
  if p_priority='critical' then
    insert into public.dinamica_nerd_aula_comments(request_id,author_id,author_label,body,kind) values(r.id,actor.id,actor.display_name,reason,'critical_opening');
  end if;
  return r;
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_create_request"(p_title text, p_description text, p_priority text, p_reason text, p_token text) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_current_profile(p_token text DEFAULT NULL::text)
 RETURNS dinamica_nerd_aula_profiles
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select dinamica_nerd_aula_private.actor(p_token); $function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_current_profile"(p_token text) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_get_request(p_request_id uuid, p_token text DEFAULT NULL::text)
 RETURNS dinamica_nerd_aula_requests
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor public.dinamica_nerd_aula_profiles := dinamica_nerd_aula_private.actor(p_token); r public.dinamica_nerd_aula_requests;
begin
  select * into r from public.dinamica_nerd_aula_requests where id=p_request_id and (actor.role='admin' or author_id=actor.id);
  if not found then raise exception 'NOT_FOUND_OR_DENIED' using errcode='42501'; end if;
  return r;
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_get_request"(p_request_id uuid, p_token text) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_list_comments(p_request_id uuid, p_token text DEFAULT NULL::text, p_offset integer DEFAULT 0)
 RETURNS SETOF dinamica_nerd_aula_comments
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  perform public.dinamica_nerd_aula_get_request(p_request_id,p_token);
  if p_offset is null or p_offset<0 then raise exception 'INVALID_OFFSET' using errcode='22023'; end if;
  return query select * from public.dinamica_nerd_aula_comments where request_id=p_request_id order by created_at,id limit 500 offset p_offset;
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_list_comments"(p_request_id uuid, p_token text, p_offset integer) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_list_requests(p_token text DEFAULT NULL::text, p_offset integer DEFAULT 0)
 RETURNS SETOF dinamica_nerd_aula_requests
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor public.dinamica_nerd_aula_profiles := dinamica_nerd_aula_private.actor(p_token);
begin
  if p_offset is null or p_offset<0 then raise exception 'INVALID_OFFSET' using errcode='22023'; end if;
  return query select r.* from public.dinamica_nerd_aula_requests r
    where actor.role='admin' or r.author_id=actor.id order by r.created_at desc,r.id desc limit 500 offset p_offset;
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_list_requests"(p_token text, p_offset integer) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_register_participant(p_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p public.dinamica_nerd_aula_profiles; email_value text := dinamica_nerd_aula_private.clean_text(p_email,254);
  token text := replace(gen_random_uuid()::text || gen_random_uuid()::text,'-','');
begin
  if email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'INVALID_EMAIL' using errcode='22023'; end if;
  insert into public.dinamica_nerd_aula_profiles(role,email,display_name) values('requester',email_value,email_value) returning * into p;
  insert into dinamica_nerd_aula_private.participant_sessions(token_hash,profile_id)
    values(encode(sha256(convert_to(token,'UTF8')),'hex'),p.id);
  return jsonb_build_object('profile',to_jsonb(p),'token',token);
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_register_participant"(p_email text) OWNER TO "postgres";

CREATE FUNCTION public.dinamica_nerd_aula_revise_priority(p_request_id uuid, p_priority text, p_reason text, p_expected_version integer, p_expected_priority text)
 RETURNS dinamica_nerd_aula_requests
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare actor public.dinamica_nerd_aula_profiles := dinamica_nerd_aula_private.actor(); r public.dinamica_nerd_aula_requests; reason text; previous text;
begin
  if actor.role<>'admin' then raise exception 'ACCESS_DENIED' using errcode='42501'; end if;
  select * into r from public.dinamica_nerd_aula_requests where id=p_request_id for update;
  if not found then raise exception 'NOT_FOUND_OR_DENIED' using errcode='42501'; end if;
  if r.version is distinct from p_expected_version or r.priority is distinct from p_expected_priority then raise exception 'STALE_REQUEST' using errcode='PT409'; end if;
  if r.status='completed' then raise exception 'REQUEST_COMPLETED' using errcode='22023'; end if;
  if p_priority is null or p_priority not in ('low','medium','high','critical') then raise exception 'INVALID_PRIORITY' using errcode='22023'; end if;
  if r.priority=p_priority then return r; end if;
  reason:=dinamica_nerd_aula_private.clean_text(p_reason,1000); previous:=r.priority;
  update public.dinamica_nerd_aula_requests set priority=p_priority,version=version+1 where id=r.id returning * into r;
  insert into public.dinamica_nerd_aula_comments(request_id,author_id,author_label,body,kind,previous_priority,new_priority)
    values(r.id,actor.id,actor.display_name,reason,'priority_change',previous,p_priority);
  return r;
end;
$function$;

ALTER FUNCTION "public"."dinamica_nerd_aula_revise_priority"(p_request_id uuid, p_priority text, p_reason text, p_expected_version integer, p_expected_priority text) OWNER TO "postgres";

ALTER TABLE "dinamica_nerd_aula_private"."participant_sessions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."dinamica_nerd_aula_comments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dinamica_nerd_aula_comments_read" ON "public"."dinamica_nerd_aula_comments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (( SELECT dinamica_nerd_aula_private.is_admin() AS is_admin));

ALTER TABLE "public"."dinamica_nerd_aula_profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dinamica_nerd_aula_profiles_read" ON "public"."dinamica_nerd_aula_profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (( SELECT dinamica_nerd_aula_private.is_admin() AS is_admin));

ALTER TABLE "public"."dinamica_nerd_aula_requests" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dinamica_nerd_aula_requests_read" ON "public"."dinamica_nerd_aula_requests" AS PERMISSIVE FOR SELECT TO "authenticated" USING (( SELECT dinamica_nerd_aula_private.is_admin() AS is_admin));

REVOKE ALL ON SCHEMA "dinamica_nerd_aula_private" FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT USAGE ON SCHEMA "dinamica_nerd_aula_private" TO "authenticated";

REVOKE ALL ON TABLE "dinamica_nerd_aula_private"."participant_sessions" FROM PUBLIC, "anon", "authenticated", "service_role";

REVOKE ALL ON TABLE "public"."dinamica_nerd_aula_comments" FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT SELECT ON TABLE "public"."dinamica_nerd_aula_comments" TO "authenticated";

GRANT DELETE ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

GRANT INSERT ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

GRANT MAINTAIN ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

GRANT REFERENCES ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

GRANT SELECT ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

GRANT TRIGGER ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

GRANT UPDATE ON TABLE "public"."dinamica_nerd_aula_comments" TO "service_role";

REVOKE ALL ON TABLE "public"."dinamica_nerd_aula_profiles" FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT SELECT ON TABLE "public"."dinamica_nerd_aula_profiles" TO "authenticated";

GRANT DELETE ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

GRANT INSERT ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

GRANT MAINTAIN ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

GRANT REFERENCES ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

GRANT SELECT ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

GRANT TRIGGER ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

GRANT UPDATE ON TABLE "public"."dinamica_nerd_aula_profiles" TO "service_role";

REVOKE ALL ON TABLE "public"."dinamica_nerd_aula_requests" FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT SELECT ON TABLE "public"."dinamica_nerd_aula_requests" TO "authenticated";

GRANT DELETE ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

GRANT INSERT ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

GRANT MAINTAIN ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

GRANT REFERENCES ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

GRANT SELECT ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

GRANT TRIGGER ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

GRANT UPDATE ON TABLE "public"."dinamica_nerd_aula_requests" TO "service_role";

REVOKE ALL ON FUNCTION "dinamica_nerd_aula_private"."active_uid"() FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "dinamica_nerd_aula_private"."active_uid"() TO "authenticated";

REVOKE ALL ON FUNCTION "dinamica_nerd_aula_private"."actor"(p_token text) FROM PUBLIC, "anon", "authenticated", "service_role";

REVOKE ALL ON FUNCTION "dinamica_nerd_aula_private"."clean_text"(value text, maximum integer) FROM PUBLIC, "anon", "authenticated", "service_role";

REVOKE ALL ON FUNCTION "dinamica_nerd_aula_private"."is_admin"() FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "dinamica_nerd_aula_private"."is_admin"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_add_comment"(p_request_id uuid, p_body text, p_token text) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_add_comment"(p_request_id uuid, p_body text, p_token text) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_add_comment"(p_request_id uuid, p_body text, p_token text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_add_comment"(p_request_id uuid, p_body text, p_token text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_advance_status"(p_request_id uuid, p_next_status text, p_expected_version integer) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_advance_status"(p_request_id uuid, p_next_status text, p_expected_version integer) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_advance_status"(p_request_id uuid, p_next_status text, p_expected_version integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_counts"(p_token text) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_counts"(p_token text) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_counts"(p_token text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_counts"(p_token text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_create_request"(p_title text, p_description text, p_priority text, p_reason text, p_token text) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_create_request"(p_title text, p_description text, p_priority text, p_reason text, p_token text) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_create_request"(p_title text, p_description text, p_priority text, p_reason text, p_token text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_create_request"(p_title text, p_description text, p_priority text, p_reason text, p_token text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_current_profile"(p_token text) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_current_profile"(p_token text) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_current_profile"(p_token text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_current_profile"(p_token text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_get_request"(p_request_id uuid, p_token text) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_get_request"(p_request_id uuid, p_token text) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_get_request"(p_request_id uuid, p_token text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_get_request"(p_request_id uuid, p_token text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_list_comments"(p_request_id uuid, p_token text, p_offset integer) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_list_comments"(p_request_id uuid, p_token text, p_offset integer) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_list_comments"(p_request_id uuid, p_token text, p_offset integer) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_list_comments"(p_request_id uuid, p_token text, p_offset integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_list_requests"(p_token text, p_offset integer) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_list_requests"(p_token text, p_offset integer) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_list_requests"(p_token text, p_offset integer) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_list_requests"(p_token text, p_offset integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_register_participant"(p_email text) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_register_participant"(p_email text) TO "anon";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_register_participant"(p_email text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_register_participant"(p_email text) TO "service_role";

REVOKE ALL ON FUNCTION "public"."dinamica_nerd_aula_revise_priority"(p_request_id uuid, p_priority text, p_reason text, p_expected_version integer, p_expected_priority text) FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_revise_priority"(p_request_id uuid, p_priority text, p_reason text, p_expected_version integer, p_expected_priority text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."dinamica_nerd_aula_revise_priority"(p_request_id uuid, p_priority text, p_reason text, p_expected_version integer, p_expected_priority text) TO "service_role";

COMMIT;
