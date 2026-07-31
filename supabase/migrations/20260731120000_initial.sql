create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  system_prompt text not null default 'Είσαι φιλικός τηλεφωνικός βοηθός εξυπηρέτησης πελατών. Μίλα ελληνικά εκτός αν ο καλών μιλήσει αγγλικά. Απαντάς μόνο με βάση τη βάση γνώσης. Αν δεν μπορείς να βοηθήσεις, πρόσφερε μεταφορά σε άνθρωπο.',
  greeting text not null default 'Γεια σας! Πώς μπορώ να σας βοηθήσω σήμερα;',
  transfer_policy text not null default 'Μετέφερε σε άνθρωπο όταν ο πελάτης το ζητήσει, όταν το αίτημα είναι εκτός βάσης γνώσης, ή όταν χρειάζεται ενέργεια που δεν μπορείς να κάνεις.',
  twilio_phone_number text unique,
  timezone text not null default 'Europe/Athens',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (user_id, org_id)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  phone_e164 text not null,
  is_available boolean not null default true,
  priority integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_org_available_idx
  on public.employees (org_id, is_available, priority);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  storage_path text not null,
  mime_type text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  content text not null,
  chunk_index integer not null default 0,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now()
);

create index document_chunks_org_idx on public.document_chunks (org_id);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  twilio_call_sid text not null unique,
  from_number text,
  to_number text,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'transferred', 'failed', 'no_answer')),
  transcript_summary text,
  transferred_to uuid references public.employees (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index calls_org_started_idx on public.calls (org_id, started_at desc);

create table public.call_events (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index call_events_call_idx on public.call_events (call_id, created_at);

insert into storage.buckets (id, name, public)
values ('knowledge-docs', 'knowledge-docs', false)
on conflict (id) do nothing;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

create or replace function public.create_organization(org_name text, org_slug text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org public.organizations;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, slug)
  values (org_name, org_slug)
  returning * into new_org;

  insert into public.memberships (user_id, org_id, role)
  values (auth.uid(), new_org.id, 'owner');

  return new_org;
end;
$$;

create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536),
  match_org_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.org_id = match_org_id
    and dc.embedding is not null
  order by dc.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function public.create_organization(text, text) to authenticated;
grant execute on function public.match_document_chunks(extensions.vector, uuid, int) to authenticated, service_role;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.employees enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.calls enable row level security;
alter table public.call_events enable row level security;

create policy "members can read orgs"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "admins can update orgs"
  on public.organizations for update
  using (public.is_org_admin(id));

create policy "members can read memberships"
  on public.memberships for select
  using (public.is_org_member(org_id) or user_id = auth.uid());

create policy "admins manage memberships"
  on public.memberships for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "members read employees"
  on public.employees for select
  using (public.is_org_member(org_id));

create policy "admins manage employees"
  on public.employees for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "members read documents"
  on public.documents for select
  using (public.is_org_member(org_id));

create policy "admins manage documents"
  on public.documents for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "members read chunks"
  on public.document_chunks for select
  using (public.is_org_member(org_id));

create policy "admins manage chunks"
  on public.document_chunks for all
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "members read calls"
  on public.calls for select
  using (public.is_org_member(org_id));

create policy "members read call events"
  on public.call_events for select
  using (
    exists (
      select 1 from public.calls c
      where c.id = call_id and public.is_org_member(c.org_id)
    )
  );

create policy "org members read knowledge docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'knowledge-docs'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "org admins upload knowledge docs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'knowledge-docs'
    and public.is_org_admin((storage.foldername(name))[1]::uuid)
  );

create policy "org admins delete knowledge docs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'knowledge-docs'
    and public.is_org_admin((storage.foldername(name))[1]::uuid)
  );
