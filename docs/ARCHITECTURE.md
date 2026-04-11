# Arquitetura do Projeto RPG Mesa

## Visao geral

Este repositorio e um monorepo com duas aplicacoes:

- `client`: frontend Vue 3 + Vite + Pinia
- `server`: backend Express + TypeScript + Supabase

Fluxo principal:

1. Usuario faz login via Supabase Auth no frontend.
2. Frontend envia token Bearer para o backend (Axios interceptor).
3. Backend valida usuario no Supabase e executa regras de negocio.
4. Dados de personagem e catalogos sao persistidos no Supabase.

## Estrutura de pastas

```
rpg-mesa/
  client/
    src/
      views/        # telas principais
      stores/       # estado global e regras de UI
      lib/api/      # camada de acesso HTTP ao backend
      lib/supabase/ # auth/storage no Supabase
      router/       # guardas e navegacao
  server/
    src/
      main.ts       # bootstrap do Express
      modules/      # modulos por dominio
      config/       # conexao e config de infra
      common/       # helpers compartilhados
```

## Frontend (client)

### Estado global

- `auth` store:
  - inicializa sessao no bootstrap (`initAuth`)
  - controla metadata local (`activeCharacterId`, `isMaster`, TTL da sessao)
  - faz login/logout via Supabase
- `characters` store:
  - carrega pagina publica
  - busca personagem por id
  - cria/edita personagem
  - solicita alteracoes (fluxo de aprovacao)
- `masterApprovals` store:
  - lista solicitacoes pendentes
  - aprova/rejeita alteracoes
- `masterCatalog` store:
  - cria entidades de catalogo (deus, classe, titulo, mapa)
  - adiciona skill/titulo/nota em personagem

### Componentes de UI compartilhados

- `client/src/components/TemaDarkLight.vue`:
  - componente de tema visual completo para light/dark
  - centraliza fundo, borda, tipografia, titulos e textos por props
  - API de props em pt-BR: `elemento`, `variante`, `clicavel`, `tema`, `preset`, `fonteTitulo`, `fonteTexto`
  - variantes disponiveis: `contexto`, `painel`, `cartao`, `item`, `aviso`

Observacao: a base esta em migracao gradual de nomenclatura para pt-BR nas camadas de UI.

### Navegacao e autorizacao

- Rotas publicas e protegidas em `client/src/router/index.ts`.
- Guarda de rota valida:
  - sessao Supabase ativa
  - metadata local da autenticacao
  - permissao de mestre para rota `/master`
- Sessao expira em 24h (controlada pelo store `auth`).

### Camada de API

- Cliente Axios central em `client/src/plugins/axios.ts`.
- `baseURL` padrao: `VITE_API_BASE_URL` ou `/api`.
- Interceptor adiciona `Authorization: Bearer <token>` automaticamente.

## Backend (server)

### Bootstrap

Arquivo `server/src/main.ts`:

- sobe Express com `cors()` e `express.json()`
- endpoint de healthcheck: `GET /health`
- monta rotas em `/api/*`

### Modulos

Cada modulo expoe router, controller e service:

- `personagem`: CRUD, listagem publica, aprovacoes, notas
- `god`: criacao de deuses (mestre)
- `city_maps`: criacao de mapas/cidades (mestre)
- `classes`: criacao de classes (mestre)
- `skill`: adicionar skills em personagem (mestre)
- `titulos`: criar titulo e adicionar em personagem (mestre)

### Autorizacao no backend

- Token Bearer e extraido do header `Authorization`.
- Validacao com Supabase em `getSupabaseClient(token)`.
- Acesso de mestre:
  - helper `ensureMasterAccess`
  - valida `MASTER_EMAIL` quando configurado
  - sem `MASTER_EMAIL`, qualquer usuario autenticado pode usar endpoints admin

## Persistencia e modelo de dados

Tabela principal: `characters`.

Campos principais usados:

- `id`, `user_id`, `name`, `level`, `avatar_url`, `campaign_id`
- `data` (JSON flexivel com campos de jogo)
- `deleted_at` para soft delete

Campos de fluxo de aprovacao em `data`:

- `pendingChangeRequest`
- `historyDocumentPath`, `historyDocumentName`, `historyDocumentMimeType`
- `adventureNotes`, `skills`, `titles`

## Integracao com Supabase Storage

No frontend (`client/src/lib/supabase/storage.ts`):

- bucket de avatar: `VITE_AVATAR_BUCKET` (default `character-avatars`)
- bucket de historia: `VITE_HISTORY_BUCKET` (default `character-history`)
- upload de avatar e documento de historia
- geracao de signed URL para documentos

## Deploy atual

`vercel.json` aponta para build do frontend:

- install: `corepack enable && yarn install --immutable`
- build: `yarn build:client`
- output: `client/dist`

Observacao: o backend Express nao e empacotado por esse fluxo de deploy no Vercel.
