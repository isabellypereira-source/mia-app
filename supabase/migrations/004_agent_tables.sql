-- Configurações do PrusaSlicer enviadas pelo agent local
create table if not exists public.agent_slicer_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  temperature integer,
  bed_temperature integer,
  infill integer,
  layer_height numeric,
  support_enabled boolean,
  raw jsonb default '{}',
  synced_at timestamptz default now(),
  created_at timestamptz default now()
);

-- GCodes enviados pelo agent local
create table if not exists public.agent_gcodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  filename text not null,
  content text,
  metadata jsonb default '{}',
  file_size integer,
  synced_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Status/heartbeat do agent local
create table if not exists public.agent_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  status text not null default 'online', -- 'online' | 'syncing' | 'error' | 'offline'
  details jsonb default '{}',
  reported_at timestamptz default now()
);

-- RLS
alter table public.agent_slicer_configs enable row level security;
alter table public.agent_gcodes enable row level security;
alter table public.agent_status enable row level security;

create policy "Users manage own slicer configs"
  on public.agent_slicer_configs for all
  using (auth.uid() = user_id);

create policy "Users manage own gcodes"
  on public.agent_gcodes for all
  using (auth.uid() = user_id);

create policy "Users manage own agent status"
  on public.agent_status for all
  using (auth.uid() = user_id);
