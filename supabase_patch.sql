-- SAT Samarkand -- PATCH: classes + teacher RPCs only.
-- Safe to run anytime. Touches NO questions and deletes NOTHING.
-- Paste this whole file into the Supabase SQL Editor and Run.

-- ---- Classes table (created/owned by a logged-in teacher) ----
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner uuid not null references auth.users(id) on delete cascade,
  join_code text not null unique,
  created_at timestamptz not null default now()
);
alter table classes enable row level security;

-- ---- Student session: name + class join code ----
create or replace function start_session(p_name text, p_join_code text)
returns table (id uuid, full_name text, class_id uuid, class_name text)
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_name text; v_code text; v_class uuid; v_cname text;
begin
  v_name := trim(coalesce(p_name,''));
  v_code := upper(trim(coalesce(p_join_code,'')));
  if v_name = '' then raise exception 'name required'; end if;
  select c.id, c.name into v_class, v_cname from classes c where upper(c.join_code) = v_code;
  if v_class is null then raise exception 'invalid class code'; end if;
  select s.id into v_id from students s
    where s.class_id = v_class and lower(s.full_name)=lower(v_name);
  if v_id is null then
    insert into students(full_name, class_id) values (v_name, v_class)
      returning students.id into v_id;
  end if;
  return query select v_id, v_name, v_class, v_cname;
end;
$$;

create or replace function whoami(p_sid uuid)
returns table (id uuid, full_name text, class_id uuid, class_name text)
language sql security definer set search_path = public as $$
  select s.id, s.full_name, s.class_id, c.name
  from students s left join classes c on c.id = s.class_id
  where s.id = p_sid;
$$;

-- ---- Teacher RPCs ----
create or replace function create_class(p_name text)
returns table (id uuid, name text, join_code text)
language plpgsql security definer set search_path = public as $$
declare uid uuid; v_code text; v_name text;
begin
  uid := auth.uid();
  if uid is null then raise exception 'not authenticated'; end if;
  v_name := trim(coalesce(p_name,''));
  if v_name = '' then raise exception 'class name required'; end if;
  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from classes c where c.join_code = v_code);
  end loop;
  return query
  insert into classes (name, owner, join_code) values (v_name, uid, v_code)
  returning classes.id, classes.name, classes.join_code;
end;
$$;

create or replace function my_classes()
returns table (id uuid, name text, join_code text, student_count bigint, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  uid := auth.uid();
  if uid is null then raise exception 'not authenticated'; end if;
  return query
  select c.id, c.name, c.join_code,
         (select count(*) from students s where s.class_id = c.id),
         c.created_at
  from classes c where c.owner = uid
  order by c.created_at;
end;
$$;

create or replace function class_stats(p_class_id uuid)
returns table (student_id uuid, full_name text, solved bigint, correct bigint, mistakes bigint)
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  uid := auth.uid();
  if uid is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from classes c where c.id = p_class_id and c.owner = uid) then
    raise exception 'forbidden';
  end if;
  return query
  with latest as (
    select distinct on (a.student_id, a.question_id)
      a.student_id, a.question_id, a.is_correct
    from attempts a
    join students s on s.id = a.student_id
    where s.class_id = p_class_id
    order by a.student_id, a.question_id, a.created_at desc
  )
  select s.id, s.full_name,
         count(l.question_id),
         count(l.question_id) filter (where l.is_correct),
         count(l.question_id) filter (where not l.is_correct)
  from students s left join latest l on l.student_id = s.id
  where s.class_id = p_class_id
  group by s.id, s.full_name
  order by s.full_name;
end;
$$;

-- ---- Grants ----
grant execute on function start_session(text,text)              to anon;
grant execute on function whoami(uuid)                          to anon;
grant execute on function create_class(text)                    to authenticated;
grant execute on function my_classes()                          to authenticated;
grant execute on function class_stats(uuid)                     to authenticated;
