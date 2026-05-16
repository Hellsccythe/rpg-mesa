# RPG de Mesa — Caminho Sem Volta

Sistema de gestão de sessões de RPG de mesa. Monorepo com Yarn 4 Workspaces.

## Stack

- **Frontend (`client/`):** Vue 3 + Vite + Pinia + Vue Router + Axios + Tailwind CSS + Supabase JS
- **Backend (`server/`):** Express 5 + TypeScript + Supabase JS + class-validator/class-transformer
- **Auth/DB/Storage:** Supabase (auth, PostgreSQL, storage de arquivos)
- **Deploy:** Frontend no Vercel (`vercel.json`), backend separado

## Env Vars

**Client:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`, `VITE_AVATAR_BUCKET`, `VITE_HISTORY_BUCKET`, `VITE_GM_AVATAR_URL`

**Server:** `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MASTER_EMAILS` (comma-separated), `ALLOWED_ORIGIN`

## Rotas do Frontend

| Rota | View | Auth |
|---|---|---|
| `/` | LoginView | pública |
| `/dashboard?characterId=` | DashboardView | auth |
| `/deuses` | DeusesView | pública |
| `/cidade` | CidadeView | auth |
| `/classes` | ClassesView | auth |
| `/skills` | SkillsView | auth |
| `/titulos` | TitulosView | auth |
| `/racas` | RacasView | auth |
| `/equipamentos` | EquipamentosView | auth |
| `/notas` | NotasView | auth |
| `/master` | MasterPanelView | auth + isMaster |
| `/master/deuses` | MasterGodsView | auth + isMaster |
| `/master/mapas` | MasterMapsView | auth + isMaster |
| `/master/personagens` | MasterCharactersView | auth + isMaster |
| `/master/equipamentos` | MasterWeaponsView | auth + isMaster |
| `/master/racas` | MasterRacasView | auth + isMaster |

## API Endpoints do Backend

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/personagens` | auth |
| GET | `/api/gods` | público |
| GET | `/api/city-maps` | auth |
| GET | `/api/classes` | público |
| GET | `/api/skills` | auth |
| GET | `/api/titulos` | público |
| GET | `/api/armas` | público |
| GET | `/api/armas/categorias` | público |
| GET | `/api/armas/admin` | isMaster |
| POST | `/api/armas/admin` | isMaster |
| PATCH | `/api/armas/admin/:id` | isMaster |
| DELETE | `/api/armas/admin/:id` | isMaster (soft delete) |
| GET | `/health` | público |

## Componentes Compartilhados

Documentação completa em `docs/COMPONENTS.md`.

| Componente | Arquivo | Propósito |
|---|---|---|
| `Modal` | `components/Modal.vue` | Modal genérico com overlay e slot de conteúdo |
| `DataTable` | `components/DataTable.vue` | **Padrão de tabela do projeto** — usar em todas as listagens CRUD admin |
| `TemaDarkLight` | `components/TemaDarkLight.vue` | Wrapper de tema dark/light com variáveis CSS |
| `SuperficieTema` | `components/SuperficieTema.vue` | Superfície com estilo de tema |
| `HamburgerDrawerMenu` | `components/HamburgerDrawerMenu.vue` | Menu lateral hambúrguer |
| `VSelect` | `components/VSelect.vue` | Select customizado |

### DataTable — uso rápido

```vue
<DataTable
  :colunas="[{ label: 'Nome' }, { label: 'Tipo', classe: 'hidden sm:block' }]"
  classe-grid="grid grid-cols-[2fr_1fr_3rem] items-center gap-3"
  :itens="listaFiltrada"
  :carregando="carregando"
  mensagem-vazia="Nenhum item cadastrado."
  @editar="iniciarEdicao"
  @deletar="confirmarDelete"
>
  <template #linha="{ item }">
    <p>{{ (item as MeuTipo).nome }}</p>
    <span class="hidden sm:block">{{ (item as MeuTipo).tipo }}</span>
  </template>
  <template #vazia-cta>
    <button @click="abrirForm">Criar primeiro</button>
  </template>
</DataTable>
```

## Banco de Dados — Tabelas

Schema completo em `docs/SCHEMA_CURRENT.sql`. Migrations em `database/migrations/` (001–015).

### `characters`

| Coluna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| user_id | UUID | FK auth.users |
| campaign_id | UUID | nullable |
| name | text | |
| level | integer | >= 1 |
| data | jsonb | pendingChangeRequest, historyDocumentPath, adventureNotes, skills, titles |
| avatar_url | text | nullable |
| deleted_at / deleted_by | timestamptz / UUID | soft delete |
| created_by / updated_by | UUID | auditoria (migration 014) |

### `equipamentos` (anteriormente `armas`)

| Coluna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| nome | VARCHAR(255) | obrigatório |
| tipo | VARCHAR(100) | legado — novo campo é `tipo_equipamento_item[]` |
| dano | VARCHAR(60) | notação de dados, ex: "1d8", "2d6+3" — só para armas |
| descricao_equipamento | VARCHAR(500) | nullable |
| pre_requisitos | VARCHAR(300) | nullable |
| peso | NUMERIC(8,2) | nullable, em kg |
| valor | NUMERIC(12,2) | nullable, em moedas |
| propriedades | VARCHAR(500) | nullable |
| classe_equipamento_item | INTEGER | FK para `classe_equipamento.item` (migration 015) |
| categoria_equipamento_item | INTEGER[] | array de FKs para `categoria_equipamento.item` |
| tipo_equipamento_item | INTEGER[] | array de FKs para `tipo_equipamento.item` (migration 015) |
| propriedade_equipamento_item | INTEGER[] | array de FKs para `propriedade_equipamento.item` (migration 015) |
| deleted_at / deleted_by | timestamptz / UUID | soft delete |
| created_at / updated_at | timestamptz | |
| created_by / updated_by | UUID | auditoria |

RLS: SELECT público (anon + authenticated); escrita via service_role (admin client).

### `classe_equipamento` (migration 015)

Pai de tipo, propriedade e categoria. Ex: "Arma", "Armadura", "Ferramenta".

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | auto via MAX(item)+1 |
| descricao | VARCHAR(100) | |
| created_at / updated_at | timestamptz | |
| deleted_at / deleted_by | timestamptz / UUID | soft delete |
| created_by / updated_by | UUID | auditoria |

### `tipo_equipamento` (migration 015)

Filho de `classe_equipamento`. Ex: "Longa distância", "Corpo a corpo".

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | |
| descricao | VARCHAR(100) | |
| classe_item | INTEGER | FK para `classe_equipamento.item` (NOT NULL) |
| soft delete / auditoria | — | padrão |

### `propriedade_equipamento` (migration 015)

Filho de `classe_equipamento`. Ex: "Perfurante", "Pesada".

Estrutura idêntica a `tipo_equipamento`.

### `categoria_equipamento`

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | |
| descricao | VARCHAR(100) | |
| classe_item | INTEGER | FK opcional para `classe_equipamento.item` (migration 015) |
| created_at / updated_at | timestamptz | |
| deleted_at / deleted_by | UUID | soft delete |
| created_by / updated_by | UUID | auditoria |

Categorias seed: 1=Armadura, 2=Exploração, 3=Cura, 4=Cosmético, 5=Utilitário, 6=Armas.

RLS: SELECT público (anon + authenticated); escrita via service_role.

### `character_creation_whitelist`

E-mails autorizados a criar personagem. Soft delete + auditoria completa.

### `gods`, `city_maps`, `classes`, `titles`, `skills`, `racas`

Tabelas de catálogo gerenciadas pelo mestre. Todas têm soft delete (`deleted_at`, `deleted_by`) e auditoria (`created_by`, `updated_by`, migration 014).

### `lore_notes`

Notas de lore — ver migrations 009–011.

## Padrões de Código

- Código e comentários em **português brasileiro (pt-BR)**
- Backend usa **admin client** (ignora RLS) para escritas; **anon client** para leituras públicas
- Soft delete padrão: `deleted_at IS NULL` para registros ativos
- DTOs com `class-validator` no backend; tipos TypeScript no frontend
- Componentes compartilhados: `Modal.vue`, `DataTable.vue`, `HamburgerDrawerMenu.vue`, `TemaDarkLight.vue`, `SuperficieTema.vue`, `VSelect.vue`
- **`DataTable.vue` é o padrão de tabela do projeto** — toda listagem CRUD admin deve usar este componente (ver `docs/COMPONENTS.md`)

## Papéis de Usuário

- **Jogador:** autenticado, acessa seu personagem no dashboard
- **Mestre (`isMaster=true`):** acessa `/master`, pode abrir qualquer personagem, gerencia catálogos

## Fluxo de Auth

1. Supabase Auth no frontend
2. `AuthMeta` no localStorage: `activeCharacterId`, `isMaster`, `authenticatedAt`
3. Sessão expira em 24h (verificado no router guard e no store)
4. Axios interceptor envia `Authorization: Bearer <token>` para o backend
5. Backend valida token no Supabase

## Storage (Supabase)

- Avatar: bucket `character-avatars` (`VITE_AVATAR_BUCKET`)
- História: bucket `character-history` (`VITE_HISTORY_BUCKET`)
