# AnalyticDashboard

Dashboard de dados agregados da app [ServiceFlow](https://github.com/lucassalino/ServiceFlow): número de pessoas, organizações, eventos, e um ranking das músicas mais usadas em setlists.

Feito com Vite + React + TypeScript + Tailwind v4, no mesmo estilo visual ("black glass") do ServiceFlow. Publicado como site estático no GitHub Pages.

## Como funciona a segurança

O site é público (GitHub Pages não suporta acesso restrito no plano free), mas os **dados não são**:

- O frontend usa apenas a `anon` / `publishable` key do Supabase — a mesma que qualquer app cliente do ServiceFlow usa. Essa chave nunca dá acesso direto às tabelas graças ao Row Level Security.
- Os números vêm de funções RPC (`admin_analytics_*`) criadas no Supabase do ServiceFlow (ver `supabase/migrations` no repo do ServiceFlow, migrations `014` e `015`). Cada função verifica, no servidor, que quem está autenticado é o email admin (`it.workdeveloper@gmail.com`) — qualquer outra conta, mesmo autenticada, recebe um erro `forbidden`.
- A `service_role key` do Supabase **nunca** entra neste projeto nem no bundle publicado.

Ou seja: qualquer pessoa pode abrir o link e ver o ecrã de login, mas só a conta admin consegue mesmo ver dados.

## Desenvolvimento local

```bash
npm install
npm run dev
```

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` já estão no `.env` (é seguro versionar — é a chave pública, protegida pelas RPCs acima).

## Deploy

Cada push para `main` corre `.github/workflows/deploy.yml`, que faz build (`npm run build`) e publica `dist/` no GitHub Pages via Actions.

Para ativar pela primeira vez: **Settings → Pages → Source → GitHub Actions** no repositório.
