-- Tabela TACO: Tabela Brasileira de Composição de Alimentos (4ª edição)
-- Fonte: github.com/marcelosanto/tabela_taco — 597 alimentos, 68 campos
create table if not exists public.taco_alimentos (
  id integer primary key,
  descricao text not null,
  categoria text,

  -- Composição centesimal (por 100g de parte comestível)
  umidade_pct numeric,
  energia_kcal numeric,
  energia_kj numeric,
  proteina_g numeric,
  lipidios_g numeric,
  colesterol_mg numeric,
  carboidrato_g numeric,
  fibra_g numeric,
  cinzas_g numeric,

  -- Minerais
  calcio_mg numeric,
  magnesio_mg numeric,
  manganes_mg numeric,
  fosforo_mg numeric,
  ferro_mg numeric,
  sodio_mg numeric,
  potassio_mg numeric,
  cobre_mg numeric,
  zinco_mg numeric,

  -- Vitaminas
  retinol_mcg numeric,
  re_mcg numeric,
  rae_mcg numeric,
  tiamina_mg numeric,
  riboflavina_mg numeric,
  piridoxina_mg numeric,
  niacina_mg numeric,
  vitamina_c_mg numeric,

  -- Ácidos graxos (g/100g)
  saturados_g numeric,
  monoinsaturados_g numeric,
  polinsaturados_g numeric,
  ag_12_0_g numeric,
  ag_14_0_g numeric,
  ag_16_0_g numeric,
  ag_18_0_g numeric,
  ag_20_0_g numeric,
  ag_22_0_g numeric,
  ag_24_0_g numeric,
  ag_14_1_g numeric,
  ag_16_1_g numeric,
  ag_18_1_g numeric,
  ag_20_1_g numeric,
  ag_18_2n6_g numeric,
  ag_18_3n3_g numeric,
  ag_20_4_g numeric,
  ag_20_5_g numeric,
  ag_22_5_g numeric,
  ag_22_6_g numeric,
  ag_18_1t_g numeric,
  ag_18_2t_g numeric,

  -- Aminoácidos (g/100g)
  triptofano_g numeric,
  treonina_g numeric,
  isoleucina_g numeric,
  leucina_g numeric,
  lisina_g numeric,
  metionina_g numeric,
  cistina_g numeric,
  fenilalanina_g numeric,
  tirosina_g numeric,
  valina_g numeric,
  arginina_g numeric,
  histidina_g numeric,
  alanina_g numeric,
  aspartato_g numeric,
  glutamato_g numeric,
  glicina_g numeric,
  prolina_g numeric,
  serina_g numeric,

  criado_em timestamptz default now()
);

-- Índice de busca por nome (busca textual)
create index if not exists taco_descricao_idx on public.taco_alimentos using gin(to_tsvector('portuguese', descricao));
create index if not exists taco_categoria_idx on public.taco_alimentos (categoria);

-- RLS: leitura pública (dados nutricionais são públicos)
alter table public.taco_alimentos enable row level security;
create policy "taco_leitura_publica" on public.taco_alimentos
  for select using (true);
