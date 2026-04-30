-- Tokens permanentes para o agent local (não expiram)
create table if not exists public.agent_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  token text not null unique default gen_random_uuid()::text,
  created_at timestamptz default now(),
  last_used_at timestamptz,
  revoked boolean default false
);

alter table public.agent_tokens enable row level security;
create policy "Users manage own agent tokens"
  on public.agent_tokens for all
  using (auth.uid() = user_id);

-- Experimentos vindos do agent (GCode) e manuais, persistidos no Supabase
create table if not exists public.experimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  formulacao_id uuid references public.formulacoes(id) on delete set null,
  formulacao_nome text,
  data date default current_date,
  resultado text check (resultado in ('sucesso', 'parcial', 'falha', 'pendente')) default 'pendente',
  descricao text,
  problema text,
  peso_impresso_g numeric,
  -- dados vindos do agent
  origem text check (origem in ('manual', 'agent')) default 'manual',
  gcode_filename text,
  gcode_id uuid references public.agent_gcodes(id) on delete set null,
  -- para ML (invisível ao usuário)
  salvo_para_treino boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.experimentos enable row level security;
create policy "Users manage own experimentos"
  on public.experimentos for all
  using (auth.uid() = user_id);
