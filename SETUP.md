# MIA — Guia de Setup (Do Zero ao Funcionando)

## 1. Instalar Node.js (uma vez)
Baixe e instale em: https://nodejs.org (versão LTS — botão verde)
Após instalar, feche e reabra o terminal. Verifique: `node --version`

## 2. Instalar dependências do projeto
No terminal, dentro da pasta `mia-app`:
```bash
npm install
```

## 3. Criar conta Supabase (grátis)
1. Acesse https://supabase.com → "Start your project"
2. Crie um projeto (nome: mia-app, região: South America)
3. Vá em **Project Settings > API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

4. Vá em **SQL Editor** e execute cada migration em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

## 4. Criar chave do Google Gemini (grátis)
1. Acesse https://aistudio.google.com/app/apikey
2. Clique "Create API Key"  
3. Copie a chave → `GOOGLE_GENERATIVE_AI_API_KEY`

## 5. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```
Edite `.env.local` com os valores coletados acima.

## 6. Rodar o projeto
```bash
npm run dev
```
Acesse: http://localhost:3000

## 7. Deploy no Vercel (grátis)
1. Suba o projeto no GitHub (crie repositório privado)
2. Acesse https://vercel.com → "Add New Project" → importe do GitHub
3. Adicione as variáveis de ambiente (mesmo conteúdo do .env.local)
4. Clique "Deploy" → pronto!

---

## Estrutura do projeto

```
mia-app/
├── app/                    # Páginas e API routes (Next.js App Router)
│   ├── (auth)/             # Login e signup
│   ├── (dashboard)/        # Chat, formulações, exportar
│   └── api/                # Endpoints do servidor
├── components/             # Componentes React
│   └── chat/               # ChatWindow, MessageBubble, MiaCard, InputBar
├── lib/ai/                 # Cérebro da MIA
│   ├── mia-system-prompt   # Persona e instruções da MIA ← edite aqui
│   ├── tools.ts            # Cálculos e ferramentas da MIA
│   └── rag.ts              # Busca vetorial (knowledge base)
├── knowledge-base/         # Documentos de referência
│   ├── reologia/           # Adicione artigos e dados aqui
│   ├── hidrocoloides/
│   ├── troubleshooting/
│   └── impressao3d/
└── supabase/migrations/    # Schema do banco de dados
```

## Testar a MIA
```bash
npm run test-mia
```

## Melhorar as respostas
1. Adicione documentos em `knowledge-base/` (arquivos .md com frontmatter)
2. Ajuste o system prompt em `lib/ai/mia-system-prompt.ts`
3. Adicione novas tools em `lib/ai/tools.ts`
4. Rode `npm run test-mia` para avaliar melhorias
