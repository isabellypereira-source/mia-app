# Tabela Brasileira de Composição de Alimentos (TACO) — 4ª edição

## Fonte e cobertura
- **Origem**: github.com/marcelosanto/tabela_taco (dados da TACO 4ª ed. UNICAMP)
- **JSON local**: `knowledge-base/taco-raw.json`
- **597 alimentos**, 68 campos por entrada
- **Tabela 1**: composição centesimal + minerais + vitaminas + colesterol
- **Tabela 2**: ácidos graxos individuais (12:0 até 22:6, trans)
- **Tabela 3**: aminoácidos (18 aminoácidos por alimento)

## Como importar para o Supabase

1. Aplicar a migration:
   ```
   supabase db push
   ```
   ou manualmente: `supabase/migrations/003_taco_table.sql`

2. Popular a tabela `taco_alimentos`:
   ```
   npx tsx scripts/seed-taco.ts
   ```

## Como a MIA usa esses dados

O RAG (`lib/ai/rag.ts`) detecta automaticamente perguntas nutricionais e busca na tabela `taco_alimentos` via full-text search em português. O contexto retornado é injetado no prompt antes de cada resposta.

## Campos disponíveis

| Grupo | Campos |
|---|---|
| Identificação | id, descricao, categoria |
| Centesimal | umidade_pct, energia_kcal, energia_kj, proteina_g, lipidios_g, colesterol_mg, carboidrato_g, fibra_g, cinzas_g |
| Minerais | calcio_mg, magnesio_mg, manganes_mg, fosforo_mg, ferro_mg, sodio_mg, potassio_mg, cobre_mg, zinco_mg |
| Vitaminas | retinol_mcg, re_mcg, rae_mcg, tiamina_mg, riboflavina_mg, piridoxina_mg, niacina_mg, vitamina_c_mg |
| Ácidos graxos | saturados_g, monoinsaturados_g, polinsaturados_g, ag_12_0_g … ag_22_6_g, ag_18_1t_g, ag_18_2t_g |
| Aminoácidos | triptofano_g, treonina_g, isoleucina_g, leucina_g, lisina_g, metionina_g, cistina_g, fenilalanina_g, tirosina_g, valina_g, arginina_g, histidina_g, alanina_g, aspartato_g, glutamato_g, glicina_g, prolina_g, serina_g |
