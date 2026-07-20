# App Financeiro

Aplicativo de controle financeiro pessoal — implementado a partir do design ["Aplicativo de controle financeiro"](https://claude.ai/design) criado no Claude Design.

## Funcionalidades

- **Início** — saldo total, contas, metas de economia e últimos lançamentos.
- **Lançamentos** — histórico completo agrupado por data, com marcação de lançamentos retroativos.
- **Assinaturas** — recorrências mensais com aviso de renovação próxima.
- **Relatórios** — visão de despesas por categoria, receitas por origem e comparativo misto.
- Adição de novos lançamentos (despesa ou receita) via modal, com seleção de categoria e conta.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

Gera assets estáticos em `dist/`, prontos para qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages, GitHub Pages etc.).
