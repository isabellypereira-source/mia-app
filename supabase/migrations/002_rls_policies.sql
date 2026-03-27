-- Row Level Security: cada usuário só vê seus próprios dados

alter table public.subscriptions enable row level security;
alter table public.formulacoes enable row level security;
alter table public.conversations enable row level security;

-- Subscriptions
create policy "users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "users can update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- Formulacoes
create policy "users can view own formulacoes"
  on public.formulacoes for select
  using (auth.uid() = user_id);

create policy "users can insert own formulacoes"
  on public.formulacoes for insert
  with check (auth.uid() = user_id);

create policy "users can update own formulacoes"
  on public.formulacoes for update
  using (auth.uid() = user_id);

create policy "users can delete own formulacoes"
  on public.formulacoes for delete
  using (auth.uid() = user_id);

-- Conversations
create policy "users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

-- KB embeddings: leitura pública (todos podem buscar)
alter table public.kb_embeddings enable row level security;

create policy "anyone can read kb embeddings"
  on public.kb_embeddings for select
  using (true);

-- Auto-criar subscription free quando usuário se registra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id, plan, status, messages_limit)
  values (new.id, 'free', 'active', 50);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
