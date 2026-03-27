-- Habilitar extensão de vetores
create extension if not exists vector;

-- Tabela de assinaturas / planos
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free', -- 'free' | 'pro' | 'enterprise'
  status text not null default 'active', -- 'active' | 'canceled' | 'past_due'
  messages_used integer not null default 0,
  messages_limit integer not null default 50, -- free: 50/mês
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de formulações
create table if not exists public.formulacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  nome text not null,
  ingredientes jsonb not null default '[]',
  parametros jsonb default '{}',
  tabela_nutri jsonb,
  resultado text check (resultado in ('sucesso', 'falha', 'em_teste')),
  observacoes text,
  versao integer not null default 1,
  parent_id uuid references public.formulacoes(id),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de conversas
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  formulacao_id uuid references public.formulacoes(id),
  titulo text,
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge base vetorizada
create table if not exists public.kb_embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}', -- {fonte, categoria, tags, confiabilidade}
  created_at timestamptz default now()
);

-- Índice vetorial para busca semântica
create index if not exists kb_embeddings_embedding_idx
  on public.kb_embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Função de busca semântica
create or replace function match_kb_embeddings(
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id, content, metadata,
    1 - (embedding <=> query_embedding) as similarity
  from public.kb_embeddings
  order by embedding <=> query_embedding
  limit match_count;
$$;
