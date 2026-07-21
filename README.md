# App Financeiro

Aplicativo web de controle financeiro pessoal (dashboard, lançamentos, assinaturas e relatórios), implementado a partir do design "Aplicativo de controle financeiro" do Claude Design. Responsivo para mobile e web.

Stack: React + TypeScript + Vite + Tailwind CSS. Os dados (contas, lançamentos, metas e assinaturas) são armazenados localmente no navegador (`localStorage`) — não há backend nem dados de exemplo pré-carregados.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:5173. Ao abrir pela primeira vez, cadastre uma conta na tela inicial antes de adicionar lançamentos.

## Build de produção

```bash
npm run build
npm run preview
```
