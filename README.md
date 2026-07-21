# App Financeiro

Aplicativo web de controle financeiro pessoal (dashboard, lançamentos, assinaturas e relatórios), implementado a partir do design "Aplicativo de controle financeiro" do Claude Design. Responsivo para mobile e web.

Stack: React + TypeScript + Vite + Tailwind CSS no front-end, Express + Drizzle ORM + PostgreSQL no back-end. Autenticação por e-mail/senha (cookie httpOnly + JWT), dados isolados por usuário.

## Rodando localmente

Requer um Postgres local. O jeito mais simples é via Docker:

```bash
docker compose up -d
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Abra http://localhost:5173. O Vite roda o front-end e faz proxy de `/api` para o servidor Express (porta 3000, iniciado junto pelo `npm run dev`).

Ao abrir pela primeira vez, crie uma conta (e-mail/senha) e cadastre uma conta bancária na tela inicial antes de adicionar lançamentos.

## Build de produção

```bash
npm run build
npm start
```

`npm start` sobe o servidor Express, que serve tanto a API (`/api/*`) quanto os arquivos estáticos do build (`dist/`).

## Deploy no Railway

1. Crie um projeto no Railway, adicione um addon Postgres e conecte-o ao serviço.
2. Configure as variáveis de ambiente do serviço: `JWT_SECRET` (gere com `openssl rand -base64 32`) e `NODE_ENV=production`. `DATABASE_URL` é injetada automaticamente pelo addon Postgres.
3. O build usa o builder **Railpack** (configurado em `railway.json`) — não é necessário Dockerfile.
4. As migrations do banco rodam automaticamente no boot do servidor.
