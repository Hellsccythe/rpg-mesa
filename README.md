# RPG Mesa

Monorepo de um sistema de mesa RPG com frontend Vue 3 e backend Express, usando Supabase para autenticacao, banco e storage.

## Sumario

- [Visao Geral](#visao-geral)
- [Tecnologias](#tecnologias)
- [Estrutura](#estrutura)
- [Pre-requisitos](#pre-requisitos)
- [Configuracao de Ambiente](#configuracao-de-ambiente)
- [Executando em Desenvolvimento](#executando-em-desenvolvimento)
- [Scripts](#scripts)
- [Fluxos Principais](#fluxos-principais)
- [Documentacao Tecnica](#documentacao-tecnica)
- [Deploy](#deploy)
- [Checklist de Manutencao](#checklist-de-manutencao)

## Visao Geral

O projeto possui dois pacotes principais:

- `client`: aplicacao frontend em Vue 3 para login, dashboard, painel do mestre e interacoes de personagem.
- `server`: API Express com regras de negocio de personagens e operacoes administrativas.

Fluxo base:

1. Usuario autentica com Supabase no frontend.
2. Frontend envia token Bearer ao backend (Axios interceptor).
3. Backend valida token no Supabase.
4. Backend aplica regras de negocio e persiste dados.

## Tecnologias

### Monorepo

- Yarn 4 Workspaces
- Node.js (recomendado >= 20.19)

### Frontend (`client`)

- Vue 3
- Vite
- Pinia
- Vue Router
- Axios
- Supabase JS
- Tailwind CSS

### Backend (`server`)

- Express 5
- TypeScript
- Supabase JS
- class-validator / class-transformer

## Estrutura

```
rpg-mesa/
  client/
    src/
      views/
      stores/
      router/
      lib/
        api/
        supabase/
      plugins/
  server/
    src/
      main.ts
      modules/
      config/
      common/
  docs/
    ARCHITECTURE.md
    API.md
    MAINTENANCE.md
```

## Pre-requisitos

- Node.js >= 20.19.0
- Corepack habilitado
- Yarn 4
- Projeto Supabase configurado

## Configuracao de Ambiente

### 1. Instalar dependencias

Na raiz do repositorio:

```bash
corepack enable
yarn install
```

### 2. Variaveis de ambiente do client

Crie `client/.env` com:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AVATAR_BUCKET=character-avatars
VITE_HISTORY_BUCKET=character-history
VITE_GM_AVATAR_URL=
```

### 3. Variaveis de ambiente do server

Crie `server/.env` com:

```env
PORT=3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MASTER_EMAIL=
CHARACTER_CREATION_ALLOWED_EMAILS=
```

Notas:

- O server tambem tenta ler variaveis `VITE_SUPABASE_*` do `client/.env` como fallback.
- `SUPABASE_SERVICE_ROLE_KEY` e importante para certas operacoes admin/publicas.
- Se `MASTER_EMAIL` ficar vazio, qualquer usuario autenticado pode acessar endpoints de mestre.
- `CHARACTER_CREATION_ALLOWED_EMAILS` restringe quem pode criar personagem (lista separada por virgula). Se vazio, qualquer usuario autenticado pode criar.

### 4. Tabela para liberar emails de criacao (painel mestre)

Para usar o cadastro de emails no menu do mestre, crie esta tabela no Supabase:

```sql
create table if not exists public.character_creation_whitelist (
  email text primary key,
  created_at timestamptz not null default now()
);
```

Observacao: o sistema usa a uniao entre `CHARACTER_CREATION_ALLOWED_EMAILS` (env) e os emails desta tabela.

## Executando em Desenvolvimento

### Subir client e server juntos

Na raiz:

```bash
yarn dev
```

### Subir individualmente

```bash
yarn dev:client
yarn dev:server
```

Padrao local:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

O Vite faz proxy de `/api` para `http://localhost:3000`.

## Scripts

Na raiz:

- `yarn dev`: client + server em paralelo
- `yarn build`: build completo
- `yarn type-check`: type-check completo
- `yarn build:client`
- `yarn build:server`
- `yarn type-check:client`
- `yarn type-check:server`

## Fluxos Principais

### Modais (Padrao Unico)

- Todo modal do frontend deve usar `client/src/components/Modal.vue` como base.
- Fechamento por `ESC` e habilitado por padrao (`closeOnEsc=true`).
- Fechamento por clique no backdrop e habilitado por padrao (`closeOnBackdrop=true`).
- Para desabilitar comportamentos em casos especificos (ex.: confirmacao critica), use props do componente.
- Evite criar overlays manuais com `fixed inset-0` nas views; mantenha o padrao centralizado no componente comum.

### Login e sessao

- Sessao via Supabase Auth.
- Metadata local guarda `activeCharacterId` e `isMaster`.
- Sessao local expira em 24h.
- Router aplica guardas para rotas protegidas e rota de mestre.

### Personagens

- Tela inicial publica lista personagens.
- Usuario autenticado gerencia seus personagens.
- Mestre pode abrir qualquer personagem por endpoint admin.

### Aprovacao de alteracoes

- Jogador envia solicitacao de alteracao (nome/avatar/historia/documento).
- Pedido fica em `data.pendingChangeRequest`.
- Mestre aprova/rejeita no painel.

### Catalogo do mestre

- Criacao de deuses, classes, titulos e mapas/cidades.
- Inclusao de skills, titulos e notas de aventura em personagens.

## Documentacao Tecnica

- Arquitetura: `docs/ARCHITECTURE.md`
- API: `docs/API.md`
- Guia de manutencao: `docs/MAINTENANCE.md`

## Deploy

`vercel.json` atual esta preparado para deploy do frontend:

- install: `corepack enable && yarn install --immutable`
- build: `yarn build:client`
- output: `client/dist`

O backend Express nao esta incluido nesse fluxo de deploy do Vercel e deve ser publicado separadamente.

## Checklist de Manutencao

Antes de abrir PR:

1. Rodar `yarn type-check`.
2. Rodar `yarn build`.
3. Validar login, dashboard e fluxo de aprovacao.
4. Atualizar documentacao quando houver mudanca de endpoint/fluxo.
