# RPG Mesa

Monorepo de um sistema de mesa RPG com frontend Vue 3 e backend Express, usando Supabase para autenticacao, banco e storage.

## Sumario

- [Visao Geral](#visao-geral)
- [Tecnologias](#tecnologias)
- [Estrutura](#estrutura)
- [Pre-requisitos](#pre-requisitos)
- [Configuracao de Ambiente](#configuracao-de-ambiente)
- [Migrations do Banco](#migrations-do-banco)
- [Executando em Desenvolvimento](#executando-em-desenvolvimento)
- [Scripts](#scripts)
- [Rotas da Aplicacao](#rotas-da-aplicacao)
- [Fluxos Principais](#fluxos-principais)
- [Deploy](#deploy)
- [Documentacao Tecnica](#documentacao-tecnica)
- [Checklist de Manutencao](#checklist-de-manutencao)

---

## Visao Geral

O projeto possui dois pacotes principais:

- `client`: aplicacao frontend em Vue 3 para login, dashboard, catalogo de deuses, mapas, notas de lore e painel do mestre.
- `server`: API Express com regras de negocio de personagens, catalogo e operacoes administrativas.

Fluxo base:

1. Usuario seleciona o personagem na tela de login e se autentica via Supabase Auth.
2. Frontend envia token Bearer ao backend em todas as requisicoes autenticadas (interceptor Axios).
3. Backend valida o token no Supabase e aplica as regras de negocio.
4. Backend persiste os dados via Supabase Admin Client (service role).

---

## Tecnologias

### Monorepo

- Yarn 4 Workspaces
- Node.js >= 20.19

### Frontend (`client`)

- Vue 3 + Composition API
- Vite
- Pinia (gerenciamento de estado)
- Vue Router
- Axios
- Supabase JS
- Tailwind CSS
- smartcrop (deteccao automatica de focal point)

### Backend (`server`)

- Express 5
- TypeScript (ESM)
- Supabase JS
- class-validator / class-transformer

---

## Estrutura

```
rpg-mesa/
  client/
    src/
      assets/
        images/          # imagens dos deuses e recursos visuais
      components/        # Modal, HamburgerDrawerMenu, BookPageContent, etc.
      composables/       # useSmartImageFocus
      data/              # panteao.ts (paginas estaticas do livro)
      lib/
        api/             # personagens.api, gods.api, lore-notes.api, ...
        supabase/        # client, storage (upload avatar/doc/pdf)
      plugins/           # axios com interceptor de token
      router/            # index.ts com guardas de rota
      stores/            # auth, characters, masterApprovals, masterCatalog
      types/             # supabase.ts (interfaces globais)
      views/             # todas as views (ver secao Rotas)
  server/
    src/
      modules/
        personagem/      # CRUD personagens, focal point, modal position, emails
        god/             # CRUD deuses + upload de imagem
        classes/         # catalogo de classes
        titulos/         # catalogo de titulos
        skill/           # skills de personagens
        city_maps/       # mapas de cidades com pontos de interesse
        lore-notes/      # notas de lore (texto + PDF)
      models/            # personagem.model.ts
      common/            # helpers (master-access)
      config/            # supabase client (anon + service role)
  database/
    migrations/          # SQLs para aplicar no Supabase (001 a 011)
  docs/
    ARCHITECTURE.md
    API.md
    MAINTENANCE.md
    SCHEMA_CURRENT.sql
```

---

## Pre-requisitos

- Node.js >= 20.19.0
- Corepack habilitado (`corepack enable`)
- Yarn 4 (`packageManager` definido no `package.json`)
- Projeto Supabase configurado com as tabelas das migrations aplicadas

---

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
VITE_AVATAR_BUCKET=character-avatars
VITE_HISTORY_BUCKET=character-history
VITE_LORE_BUCKET=lore-notes
VITE_GM_AVATAR_URL=
```

> Em desenvolvimento o Vite faz proxy de `/api` para `http://localhost:3000`, entao `VITE_API_BASE_URL` nao e necessario localmente. Em producao o Vercel gerencia o roteamento via `vercel.json`.

### 3. Variaveis de ambiente do server

Crie `server/.env` com:

```env
PORT=3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MASTER_EMAIL=
AVATAR_BUCKET=character-avatars
ALLOWED_ORIGIN=*
```

Notas:

- `SUPABASE_SERVICE_ROLE_KEY` e obrigatorio para operacoes admin (leitura publica de personagens, upserts de mestre, etc.).
- `MASTER_EMAIL` define qual email tem acesso ao painel de mestre. Se vazio, qualquer usuario autenticado pode acessar endpoints admin.
- `ALLOWED_ORIGIN` controla o header CORS. Use `*` em desenvolvimento ou a URL do frontend em producao.
- O server tenta ler variaveis `VITE_SUPABASE_*` do `client/.env` como fallback se as proprias nao estiverem definidas.

---

## Migrations do Banco

Todas as migrations ficam em `database/migrations/` e devem ser aplicadas em ordem no **Supabase SQL Editor** (Dashboard → SQL Editor → New query). Todas usam `IF NOT EXISTS` e sao seguras para re-execucao.

| Arquivo | Descricao |
|---|---|
| `001_missing_tables.sql` | Cria tabelas `gods`, `city_maps`, `classes`, `titles` |
| `002_rls_policies.sql` | Politicas RLS para as tabelas principais |
| `003_indexes.sql` | Indices de performance |
| `004_add_deleted_by_to_characters.sql` | Coluna `deleted_by` em `characters` |
| `005_add_requirements_to_classes.sql` | Requisitos de classes |
| `007_add_username_to_characters.sql` | Campo `username` em `characters` |
| `008_character_creation_whitelist.sql` | Tabela de emails autorizados a criar personagem |
| `009_lore_notes.sql` | Tabela `lore_notes` (notas de lore do mestre) |
| `010_lore_notes_character.sql` | Coluna `character_id` em `lore_notes` (nota por personagem) |
| `011_lore_notes_pdf_url.sql` | Coluna `pdf_url` em `lore_notes` (anexo PDF opcional) |

---

## Executando em Desenvolvimento

### Client e server juntos

Na raiz:

```bash
yarn dev
```

### Individualmente

```bash
yarn dev:client   # http://localhost:5173
yarn dev:server   # http://localhost:3000
```

O Vite faz proxy de `/api` para `http://localhost:3000` automaticamente.

---

## Scripts

Na raiz do repositorio:

| Script | Descricao |
|---|---|
| `yarn dev` | Sobe client e server em paralelo |
| `yarn build` | Build completo (server depois client) |
| `yarn build:client` | Build apenas do frontend |
| `yarn build:server` | Build apenas do backend |
| `yarn preview` | Preview do build do client |
| `yarn type-check` | Type-check completo (client + server) |
| `yarn type-check:client` | Type-check apenas do client |
| `yarn type-check:server` | Type-check apenas do server |

---

## Rotas da Aplicacao

### Publicas (sem login)

| Rota | View | Descricao |
|---|---|---|
| `/` | `LoginView` | Selecao de personagem e login |
| `/deuses` | `DeusesView` | Catalogo de deuses com filtros e modal detalhado |

### Jogador (requer autenticacao)

| Rota | View | Descricao |
|---|---|---|
| `/dashboard` | `DashboardView` | Ficha completa do personagem |
| `/cidade` | `CidadeView` | Mapas da cidade com pontos de interesse |
| `/classes` | `ClassesView` | Catalogo de classes do personagem |
| `/skills` | `SkillsView` | Habilidades do personagem |
| `/titulos` | `TitulosView` | Titulos e honrarias |
| `/notas` | `NotasView` | Biblioteca de notas em formato de livro com flip e zoom |

### Mestre (requer autenticacao + role mestre)

| Rota | View | Descricao |
|---|---|---|
| `/master` | `MasterPanelView` | Painel principal: personagens, pendencias, notas de lore, ferramentas |
| `/master/deuses` | `MasterGodsView` | CRUD completo de deuses com upload de imagem |
| `/master/mapas` | `MasterMapsView` | Gerenciamento de mapas e pontos de interesse |
| `/master/personagens` | `MasterCharactersView` | Ajuste de enquadramento da imagem no modal de login por personagem |

---

## Fluxos Principais

### Login e sessao

- Tela inicial publica lista os personagens cadastrados.
- Clicar em um personagem abre modal com imagem hero e campos de usuario/senha.
- A imagem hero usa deteccao automatica de focal point (smartcrop) ou posicao configurada pelo mestre.
- Sessao via Supabase Auth; metadata local (`rpg-mesa.auth-meta`) guarda `idPersonagemAtivo` e `eMestre`.
- Sessao local expira em 24h; ao expirar o usuario e redirecionado com aviso.
- Router guards protegem rotas `requiresAuth` e `requiresMaster`.

### Personagens

- Mestre libera emails no painel; jogadores criam conta e personagem na propria tela de login.
- Jogador pode solicitar alteracao de nome, avatar ou historia (fica em `data.pendingChangeRequest`).
- Mestre aprova ou rejeita a solicitacao no painel; dados so sao aplicados apos aprovacao.
- Mestre pode ajustar o enquadramento da imagem hero do modal individualmente por personagem em `/master/personagens`.

### Catalogo do mestre

- Deuses: CRUD completo com upload de imagem e configuracao de posicao (card e modal).
- Classes e titulos: criados pelo mestre e associados a personagens pelo painel.
- Skills: adicionadas individualmente a personagens pelo painel.
- Mapas: gerenciados em `/master/mapas` com pontos de interesse clicaveis.

### Notas de Lore

- Mestre cria notas em `/master` com titulo, subtitulo, conteudo e PDF opcional.
- Conteudo separado por `---` em linha propria gera paginas distintas no visualizador.
- Notas podem ser globais (visiveis a todos) ou exclusivas de um personagem.
- Jogadores acessam em `/notas` em um visualizador de livro com animacao de virar pagina, zoom (desktop) e swipe (mobile).

### Modais

- Todo modal usa `client/src/components/Modal.vue` como base.
- Suporta tema claro/escuro/auto, focus trap, ESC para fechar e backdrop clicavel.
- Nao crie overlays manuais com `fixed inset-0` nas views.

---

## Deploy

O projeto e deployado inteiro no Vercel conforme `vercel.json`:

- **Build**: `yarn build:server && yarn build:client`
- **Output**: `client/dist`
- **API**: requisicoes para `/api/*` sao reescritas para `/api/index` (server como funcao serverless)
- **Assets**: cache imutavel de 1 ano para arquivos em `/assets/`
- **HTML**: sem cache para garantir atualizacoes imediatas
- **Headers de seguranca**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

---

## Documentacao Tecnica

- Arquitetura detalhada: `docs/ARCHITECTURE.md`
- Referencia de endpoints: `docs/API.md`
- Guia de manutencao: `docs/MAINTENANCE.md`
- Schema atual do banco: `docs/SCHEMA_CURRENT.sql`

---

## Checklist de Manutencao

Antes de abrir PR ou fazer deploy:

1. Rodar `yarn type-check`.
2. Rodar `yarn build`.
3. Validar login de jogador e mestre.
4. Validar fluxo de aprovacao de solicitacao.
5. Se alterou schema, criar migration em `database/migrations/` e aplicar no Supabase.
6. Se adicionou variavel de ambiente, atualizar este README e o `vercel.json` se necessario.
