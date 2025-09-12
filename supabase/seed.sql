-- Extensions
create extension if not exists "uuid-ossp";

-- Tables
create table if not exists app_session (
  id uuid primary key default uuid_generate_v4(),
  label text,
  is_active boolean default true,
  started_at timestamptz default now()
);

create table if not exists rida_entry (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references app_session(id) on delete cascade,
  title text not null,
  status text default 'en_cours' check (status in ('nouveau','en_cours','clos')),
  owner text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists resource_item (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references app_session(id) on delete cascade,
  name text not null,
  type text,
  location text,
  contact text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vue KPIs
create or replace view dashboard_kpis as
with r as (
  select session_id,
         count(*) as rida_total,
         count(*) filter (where status='en_cours') as rida_en_cours,
         count(*) filter (where status='clos') as rida_clos
  from rida_entry group by session_id
), res as (
  select session_id, count(*) as ressources_total
  from resource_item group by session_id
)
select coalesce(r.session_id, res.session_id) as session_id,
       coalesce(r.rida_total,0) as rida_total,
       coalesce(r.rida_en_cours,0) as rida_en_cours,
       coalesce(r.rida_clos,0) as rida_clos,
       coalesce(res.ressources_total,0) as ressources_total
from r full outer join res on r.session_id = res.session_id;

-- Session par défaut si absente
insert into app_session (label, is_active)
select 'session_par_defaut', true
where not exists (select 1 from app_session where label='session_par_defaut');
