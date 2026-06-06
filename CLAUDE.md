# RPG de Mesa — Caminho Sem Volta

Sistema de gestão de sessões de RPG de mesa. Monorepo com Yarn 4 Workspaces.

## Stack

- **Frontend (`client/`):** Vue 3 + Vite + Pinia + Vue Router + Axios + Tailwind CSS + Supabase JS
- **Backend (`server/`):** Express 5 + TypeScript + Supabase JS + class-validator/class-transformer
- **Auth/DB/Storage:** Supabase (auth, PostgreSQL, storage de arquivos)
- **Deploy:** Frontend no Vercel (`vercel.json`), backend separado

## Env Vars

**Client:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`, `VITE_AVATAR_BUCKET`, `VITE_HISTORY_BUCKET`, `VITE_GM_AVATAR_URL`

**Server:** `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MASTER_EMAILS` (comma-separated), `ALLOWED_ORIGIN`, `ENCRYPTION_KEY`

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
| `/master/skills` | MasterSkillsView | auth + isMaster |
| `/master/tabelas-acessorias` | MasterTabelasAcessoriasView | auth + isMaster |
| `/master/logins` | MasterLoginRequestsView | auth + isMaster |
| `/master/usuarios` | MasterUsersView | auth + isMaster |
| `/master/imagens` | MasterImagesView | auth + isMaster |
| `/master/passados` | MasterPassadosView | auth + isMaster |
| `/master/classes-secretas` | MasterClassesSecretasView | auth + isMaster |
| `/master/skill-overrides` | MasterSkillOverridesView | auth + isMaster |
| `/onboarding?characterId=` | OnboardingView | auth (player) |

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
| GET | `/api/skills/catalogo` | público |
| POST | `/api/skills/admin/catalogo` | isMaster |
| PATCH | `/api/skills/admin/catalogo/:id` | isMaster |
| DELETE | `/api/skills/admin/catalogo/:id` | isMaster |
| GET | `/api/skills/tipos` | público |
| POST/PATCH/DELETE | `/api/skills/tipos/admin[/:item]` | isMaster |
| GET | `/api/skills/categorias` | público |
| POST/PATCH/DELETE | `/api/skills/categorias/admin[/:item]` | isMaster |
| GET | `/api/skills/tipos-dano` | público |
| POST/PATCH/DELETE | `/api/skills/tipos-dano/admin[/:item]` | isMaster |
| GET | `/api/tabelas-acessorias/tipos` | público |
| GET | `/api/tabelas-acessorias/categorias-arma` | público |
| GET | `/api/tabelas-acessorias/propriedades-arma` | público |
| GET | `/api/tabelas-acessorias/classes-arma` | público |
| GET | `/api/tabelas-acessorias/categorias-armadura` | público |
| GET | `/api/tabelas-acessorias/propriedades-armadura` | público |
| GET | `/api/tabelas-acessorias/classes-armadura` | público |
| GET | `/api/tabelas-acessorias/categorias-variados` | público |
| GET | `/api/tabelas-acessorias/propriedades-variados` | público |
| GET | `/api/tabelas-acessorias/classes-variados` | público |
| GET | `/api/indole` | público |
| GET | `/api/genero` | público |
| POST | `/api/character-creation-requests` | público |
| POST | `/api/character-creation-requests/upload-avatar` | público |
| POST | `/api/character-creation-requests/upload-historia` | público |
| GET | `/api/character-creation-requests/admin` | isMaster |
| GET | `/api/character-creation-requests/admin/pendentes/count` | auth |
| PATCH | `/api/character-creation-requests/admin/:id/aprovar` | isMaster |
| PATCH | `/api/character-creation-requests/admin/:id/rejeitar` | isMaster |
| GET | `/api/usuarios/admin` | isMaster |
| PATCH | `/api/usuarios/admin/:id` | isMaster |
| PATCH | `/api/usuarios/admin/:id/resetar-senha` | isMaster |
| PATCH | `/api/usuarios/admin/:id/resetar-senha-padrao` | isMaster |
| PATCH | `/api/usuarios/admin/:id/ativo` | isMaster |
| POST | `/api/usuarios/admin/pre-registrar` | isMaster |
| DELETE | `/api/usuarios/admin/:id/pre-registro` | isMaster |
| DELETE | `/api/usuarios/admin/:id` | isMaster (hard delete: auth + personagem + storage) |
| PATCH | `/api/personagens/:id/escolher-raca` | auth (próprio player ou mestre) |
| GET | `/api/passados` | público |
| POST | `/api/passados/admin` | isMaster |
| PATCH | `/api/passados/admin/:id` | isMaster |
| DELETE | `/api/passados/admin/:id` | isMaster (soft delete) |
| GET | `/api/skills/admin/catalogo/:id/referencias` | isMaster (passados, títulos e classes que usam a skill) |
| GET | `/api/skills/admin/overrides?character_id=X` | isMaster |
| POST | `/api/skills/admin/overrides` | isMaster |
| PATCH | `/api/skills/admin/overrides/:id` | isMaster |
| DELETE | `/api/skills/admin/overrides/:id` | isMaster |
| GET | `/api/classes/admin` | isMaster |
| GET | `/api/classes/para-player` | auth (retorna normais + secretas reveladas ao character) |
| GET | `/api/classes/secretas/admin` | isMaster (lista classes secretas com titular atual) |
| POST | `/api/classes/secretas/admin/revelar` | isMaster (revela classe secreta a um personagem) |
| DELETE | `/api/classes/secretas/admin/revogar/:classeId` | isMaster (revoga acesso) |
| PATCH | `/api/personagens/admin/:id/status` | isMaster (vivo \| morto; morte libera classe secreta) |

## Componentes Compartilhados

Documentação completa em `docs/COMPONENTS.md`.

| Componente | Arquivo | Propósito |
|---|---|---|
| `Modal` | `components/Modal.vue` | Modal genérico com overlay e slot de conteúdo |
| `DataTable` | `components/DataTable.vue` | **Padrão de tabela do projeto** — usar em todas as listagens CRUD admin |
| `TemaDarkLight` | `components/TemaDarkLight.vue` | Wrapper de tema dark/light com variáveis CSS |
| `SuperficieTema` | `components/SuperficieTema.vue` | Superfície com estilo de tema |
| `HamburgerDrawerMenu` | `components/HamburgerDrawerMenu.vue` | Menu lateral hambúrguer |
| `VSelect` | `components/VSelect.vue` | Select customizado — usar em todos os dropdowns (v-model string\|number, options: {value,label}[]) |
| `TabelaEditor` | `components/TabelaEditor.vue` | CRUD inline para tabelas de lookup simples (item INTEGER + descricao). Props: titulo, itens, categorias?, campoCategoria?, labelCategoria?. Emite: criar, editar, deletar |

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

Schema completo em `docs/SCHEMA_CURRENT.sql`. Migrations em `database/migrations/` (001–045).

**IMPORTANTE:** Migrations 022–023 converteram todas as PKs de UUID → INTEGER IDENTITY. Todas as tabelas de entidade usam `id INTEGER` como PK. `user_id` (referência a `auth.users`) permanece UUID.

**Migration 027:** `created_by`, `updated_by`, `deleted_by` foram convertidos de UUID → TEXT em todas as tabelas. Agora armazenam o **email do usuário** que realizou a ação (ex: `gm@exemplo.com`). Use sempre `getUserDisplayEmail(user)` nos serviços.

**Referências entre tabelas são sempre por convenção de inteiro — nunca usar FOREIGN KEY constraints no banco.**

### `usuarios` (migration 027)

Contas de acesso ao sistema. Criada ao aprovar uma solicitação (players) ou seed manual (GMs).

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| auth_user_id | UUID | referência a `auth.users(id)` por convenção |
| real_email | TEXT | email real do jogador ou GM |
| username | TEXT | nullable — login handle |
| tipo | TEXT | `'gm'` \| `'player'` |
| ativo | BOOLEAN | default TRUE |
| created_at / updated_at | timestamptz | |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |

Endpoints: `GET/PATCH /api/usuarios/admin`, `PATCH /api/usuarios/admin/:id/resetar-senha`, `PATCH /api/usuarios/admin/:id/ativo`.
Tela: `/master/usuarios` → `MasterUsersView.vue`.

### `characters`

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY (migration 022) |
| user_id | UUID | referência a auth.users |
| campaign_id | UUID | nullable |
| name | text | |
| username | text | login handle, único |
| level | integer | >= 1 |
| data | jsonb | pendingChangeRequest, historyDocumentPath, adventureNotes, skills, titles, avatarFocalPoint, classPoints, **atributos**, **equipamentos_iniciais**, **deusEtapaConcluida** |
| avatar_url | text | nullable |
| raca_id | INTEGER | referência a `racas.id` — null até escolha no onboarding |
| passado_id | INTEGER | referência a `passados.id` — null até escolha no onboarding |
| deus_id | INTEGER | referência a `gods.id` — null se player pulou etapa |
| status | TEXT | `'vivo'` \| `'morto'` — default `'vivo'` (migration 043) |
| indole_id | INTEGER | referência a `indole.id` (migration 024) |
| genero_id | INTEGER | referência a `genero.id` (migration 025) |
| aparencia_fisica | text | nullable |
| historia_texto | text | nullable |
| historia_doc_url | text | nullable |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete (migration 027: deleted_by agora é TEXT/email) |
| created_by / updated_by | TEXT | email do autor (migration 027, antes UUID) |

### `indole` (migration 024)

Alinhamento/índole dos personagens e deuses.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| codigo | VARCHAR(30) | 'bom', 'neutro-bom', 'neutro', 'neutro-ruim', 'ruim' |
| descricao | VARCHAR(100) | label exibido na UI |

Seed fixo — não gerenciado pelo mestre. Endpoint: `GET /api/indole`.

### `genero` (migration 025)

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| codigo | VARCHAR(30) | 'ela', 'ele', 'outro' |
| descricao | VARCHAR(100) | label exibido na UI |
| pronome | VARCHAR(50) | pronome de tratamento |

Seed fixo. Endpoint: `GET /api/genero`.

### `character_creation_requests` (migration 026)

Solicitações de criação de personagem submetidas por jogadores, pendentes de aprovação do mestre.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| email | TEXT | email real do jogador |
| username | TEXT | login handle desejado, único |
| password_hash | TEXT | senha criptografada AES-256-CBC (não bcrypt) |
| nome | TEXT | nome completo do personagem |
| avatar_url | TEXT | nullable — path no bucket `character-avatars` |
| indole_id | INTEGER | referência a `indole.id` |
| genero_id | INTEGER | referência a `genero.id` |
| aparencia_fisica | TEXT | mínimo 30 letras sem espaços |
| historia_texto | TEXT | nullable — mínimo 100 letras ou doc obrigatório |
| historia_doc_url | TEXT | nullable — path no bucket `character-history` |
| status | TEXT | 'pendente' \| 'aprovado' \| 'rejeitado' |
| rejeitado_motivo | TEXT | nullable |
| revisado_em / revisado_por | timestamptz / UUID | auditoria de revisão |
| deleted_at / deleted_by | timestamptz / UUID | soft delete |
| created_at / updated_at | timestamptz | |

Ao aprovar: cria usuário no Supabase Auth com email `{username}@rpg.internal` + descriptografa senha → cria registro em `characters`.

### `equipamentos` (anteriormente `armas`)

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY (migration 022) |
| nome | VARCHAR(255) | obrigatório |
| tipo | VARCHAR(100) | legado — novo campo é `tipo_equipamento_item[]` |
| dano | VARCHAR(60) | notação de dados, ex: "1d8", "2d6+3" — só para armas |
| descricao_equipamento | VARCHAR(500) | nullable |
| pre_requisitos | VARCHAR(300) | nullable |
| peso | NUMERIC(8,2) | nullable, em kg |
| valor | NUMERIC(12,2) | nullable, em moedas |
| propriedades | VARCHAR(500) | nullable |
| classe_equipamento_item | INTEGER | referência a `classe_equipamento.item` |
| categoria_equipamento_item | INTEGER[] | array de referências a `categoria_equipamento.item` |
| tipo_equipamento_item | INTEGER[] | array de referências a `tipo_equipamento.item` |
| propriedade_equipamento_item | INTEGER[] | array de referências a `propriedade_equipamento.item` |
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
| classe_item | INTEGER | referência a `classe_equipamento.item` (NOT NULL) |
| soft delete / auditoria | — | padrão |

### `propriedade_equipamento` (migration 015)

Filho de `classe_equipamento`. Ex: "Perfurante", "Pesada". Estrutura idêntica a `tipo_equipamento`.

### `categoria_equipamento`

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | |
| descricao | VARCHAR(100) | |
| classe_item | INTEGER | referência a `classe_equipamento.item` (opcional) |
| created_at / updated_at | timestamptz | |
| deleted_at / deleted_by | UUID | soft delete |
| created_by / updated_by | UUID | auditoria |

Categorias seed: 1=Armadura, 2=Exploração, 3=Cura, 4=Cosmético, 5=Utilitário, 6=Armas.

RLS: SELECT público (anon + authenticated); escrita via service_role.

### `character_creation_whitelist`

E-mails autorizados a submeter solicitação de criação. Soft delete + auditoria completa.

### `skills`

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY (migration 022) |
| name | VARCHAR(100) | obrigatório |
| description | VARCHAR(2000) | nullable |
| raca_vinculada | TEXT[] | array de nomes de raças (migration 046 — era VARCHAR(100)) |
| skill_tipo_item | INTEGER | referência a `skill_tipo.item` (migration 020) |
| skill_categoria_item | INTEGER[] | array de referências a `skill_categoria.item` (migration 046 — era INTEGER) |
| skill_tipo_dano_item | INTEGER[] | array de referências a `skill_tipo_dano.item` (migration 046 — era INTEGER) |
| multiplicador_atributo | VARCHAR(60) | atributo que escala o dano: 'aura', 'forca', 'destreza', 'resistencia', 'inteligencia' (migration 047 — renomeado de damage_display) |
| damage_base | TEXT | notação de dado, ex: "1d8", "2d6+3" (migration 047 — era NUMERIC) |
| effect_description | VARCHAR(500) | descrição curta do efeito |
| custo | INTEGER | custo de recurso/mana |
| cooldown | INTEGER | cooldown em turnos |
| range | VARCHAR(60) | alcance, ex: "Toque", "10m" |
| required_class | VARCHAR(100) | ID da classe requerida |
| deleted_at / deleted_by | timestamptz / UUID | soft delete |
| created_by / updated_by | UUID | auditoria |

**`effect_value` foi removido (migration 047).** O valor é calculado em runtime combinando `damage_base` (dado) com o atributo do personagem em `multiplicador_atributo`.

### `skill_character_override` (migration 048)

Override de skill por personagem. Permite que o mestre configure dano base ou multiplicador diferentes para um player específico. `UNIQUE(skill_name, character_id)`.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| skill_name | TEXT | nome da skill (referência a `characters.data.skills[].name`) |
| character_id | INTEGER | referência a `characters.id` |
| damage_base_override | TEXT | notação de dado sobrescrita, ex: "2d8" |
| multiplicador_override | VARCHAR(50) | atributo sobrescrito, ex: "forca" |
| created_at / updated_at | timestamptz | |
| created_by / updated_by | TEXT | email do mestre |

Gerenciada em `/master/skill-overrides`. API: `GET/POST/PATCH/DELETE /api/skills/admin/overrides[/:id]` (isMaster).

### `skill_tipo`, `skill_categoria`, `skill_tipo_dano` (migration 020)

Tabelas de lookup para skills. Padrão `item INTEGER PK` + `descricao VARCHAR(100)`. Gerenciadas em `/master/skills` abas Tipos/Categorias/Tipos de Dano.

### `gods`, `city_maps`, `classes`, `titles`, `racas`

Tabelas de catálogo gerenciadas pelo mestre. PKs convertidas para INTEGER IDENTITY (migration 022). Todas têm soft delete (`deleted_at`, `deleted_by`) e auditoria (`created_by`, `updated_by`, migration 014).

`gods` tem `indole_id INTEGER` referenciando `indole.id`.

**`classes`** tem `is_secret BOOLEAN DEFAULT FALSE` (migration 042). Classes secretas não aparecem no onboarding nem para outros players — só são reveladas pelo mestre através de `/master/classes-secretas`. São exclusivas: apenas um personagem vivo por sessão pode deter cada classe secreta.

**`titles`** tem `is_hidden BOOLEAN DEFAULT FALSE` (oculta requisitos) e `classe_secreta_id INTEGER DEFAULT NULL` (migration 045). Quando `classe_secreta_id` é preenchido, o título só é visível para players que tiverem essa classe secreta revelada.

### `classe_secreta_revelada` (migration 044)

Controla qual personagem detém cada classe secreta. Constraint `UNIQUE(classe_id)` garante exclusividade.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| classe_id | INTEGER | referência a `classes.id` — UNIQUE |
| character_id | INTEGER | referência a `characters.id` |
| revealed_at | TIMESTAMPTZ | data da revelação |
| revealed_by | TEXT | email do mestre que revelou |

- Ao revelar: mestre acessa `/master/classes-secretas`, seleciona classe e personagem → POST `/api/classes/secretas/admin/revelar`
- Ao revogar: mestre clica em "Revogar" → DELETE `/api/classes/secretas/admin/revogar/:classeId`
- Ao marcar personagem como morto: `alterarStatus` remove automaticamente todos os registros de `classe_secreta_revelada` do personagem, liberando as classes para outros

### Tabelas acessórias de equipamento (migrations 019)

Hierarquia de lookup para equipamentos. Todas seguem padrão `item INTEGER PK` + `descricao VARCHAR(100)` + soft delete + auditoria. Referências por convenção de inteiro, sem constraints.

| Tabela | Pai | Notas |
|---|---|---|
| `equipamento_tipo` | — | Seed: 1=Arma, 2=Armadura, 3=Variados |
| `categoria_arma` | `equipamento_tipo_item=1` fixo | Categorias de arma |
| `categoria_armadura` | `equipamento_tipo_item=2` fixo | Categorias de armadura |
| `categoria_variados` | `equipamento_tipo_item=3` fixo | Categorias de variados |
| `propriedade_arma` | `categoria_arma_item` opcional | Propriedades de arma |
| `classe_arma` | `categoria_arma_item` opcional | Classes de arma |
| `propriedade_armadura` | `categoria_armadura_item` opcional | Propriedades de armadura |
| `classe_armadura` | `categoria_armadura_item` opcional | Classes de armadura |
| `propriedade_variados` | `categoria_variados_item` opcional | Propriedades de variados |
| `classe_variados` | `categoria_variados_item` opcional | Classes de variados |

Gerenciadas em `/master/tabelas-acessorias`. Backend em `server/src/modules/tabelas-acessorias/`.

### `passados` (migration 032)

Origens/históricos dos personagens, gerenciados pelo mestre. Cada passado pode conceder múltiplas skills e/ou títulos ao player que o escolher no onboarding.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| nome | VARCHAR(100) | obrigatório |
| descricao | TEXT | nullable |
| foto_url | TEXT | nullable — URL de imagem de capa |
| skill_ids | INTEGER[] | array de `skills.id` — skills concedidas |
| titulo_ids | INTEGER[] | array de `titles.id` — títulos concedidos |
| created_at / updated_at | timestamptz | |
| created_by / updated_by | TEXT | email do autor |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |

Backend retorna passado enriquecido: além dos IDs, inclui `skills: [{id,name}]` e `titulos: [{id,name}]`.
Tela: `/master/passados` → `MasterPassadosView.vue`.
API: `GET /api/passados` (público), `POST/PATCH/DELETE /api/passados/admin[/:id]` (isMaster).

### `lore_notes`

Notas de lore — ver migrations 009–011. PK convertida para INTEGER IDENTITY (migration 022).

## Integridade de Dados — Deleção em Cascata

### Deleção de skill do catálogo (`DELETE /api/skills/admin/catalogo/:id`)

Ao deletar uma skill, o backend (via `skillService.deletarDoCatalogo`) automaticamente:
1. Faz soft-delete da skill em `skills`
2. Remove o `skill.id` de `passados.skill_ids[]` em todos os passados que a referenciam
3. Remove o `skill.id` de `titles.skill_ids[]` em todos os títulos que a referenciam
4. Remove o `skill.name` de `classes.starting_skills[]` em todas as classes que a referenciam

Antes da confirmação, o frontend (`MasterSkillsView`) chama `GET /api/skills/admin/catalogo/:id/referencias` e exibe no modal quais registros serão afetados.

**Referências checadas:** `passados.skill_ids`, `titles.skill_ids`, `classes.starting_skills` (por nome, pois `starting_skills` é `string[]`).
**Não checado:** `characters.data.skills` (skills já concedidas a personagens — são histórico pessoal e não são removidas).

## Padrões de Código

- Código e comentários em **português brasileiro (pt-BR)**
- Backend usa **admin client** (ignora RLS) para escritas; **anon client** para leituras públicas
- Soft delete padrão: `deleted_at IS NULL` para registros ativos
- DTOs com `class-validator` no backend; tipos TypeScript no frontend
- Componentes compartilhados: `Modal.vue`, `DataTable.vue`, `HamburgerDrawerMenu.vue`, `TemaDarkLight.vue`, `SuperficieTema.vue`, `VSelect.vue`
- **`DataTable.vue` é o padrão de tabela do projeto** — toda listagem CRUD admin deve usar este componente (ver `docs/COMPONENTS.md`)
- **Nunca usar FOREIGN KEY constraints no banco** — referências entre tabelas são por convenção de inteiro apenas
- IDs de entidades no frontend são `number | string` (union type) por compatibilidade com o período de transição UUID→INTEGER

### Modal — padrões

- `Modal.vue` tem default `max-w-2xl` quando nenhum `panel-class` é passado
- **Todos os modais de formulário e confirmação devem usar `:close-on-backdrop="false"`** — sem isso, clicar fora fecha o modal e o usuário perde o que estava preenchendo
- Modais de confirmação pequenos: `panel-class="max-w-sm"` + `tema="escuro"` + `:close-on-backdrop="false"` + `:show-close-button="false"`
- **Toda ação destrutiva ou irreversível nas telas master deve ter modal de confirmação** antes de executar
- Modais de formulário simples (2-3 campos): `max-w-sm`; formulários maiores: `max-w-md` ou `max-w-xl`
- **Nunca usar modais locais** (divs com `@click.self`) — sempre usar o componente `Modal.vue`. `MasterWeaponsView` foi o último a ser refatorado (3 modais: delete, add lookup, manage lookup)
- **Bug interno resolvido (não fazer de novo):** `handleBackdropClick` usa `event.composedPath()` em vez de `panelRef.contains(target)` — sem isso, remover um elemento do DOM durante o click handler (ex: chip de skill) fazia o modal fechar indevidamente

## Papéis de Usuário

- **Jogador (tipo `player`):** autenticado, acessa apenas seu personagem no dashboard. Login com `{username}@rpg.internal`.
- **Mestre (tipo `gm` / `isMaster=true`):** acessa `/master`, pode abrir qualquer personagem, gerencia catálogos. Login com email real. Definido via `MASTER_EMAILS` env var.

Ambos os tipos têm registro na tabela `usuarios`. Players são criados automaticamente na aprovação.

## Gerenciamento de Usuários

- Tela: `/master/usuarios` → `MasterUsersView.vue`
- Funções: listar todos, filtrar por tipo/status, editar username/tipo/nome do personagem, reset de senha, ativar/desativar conta, liberar/remover pré-registros, **deletar** (remove auth + personagem + avatar storage)
- Username change atualiza: `usuarios.username` + `characters.username` + email Supabase Auth (`{novo}@rpg.internal`) + `user_metadata.display_name`
- Desativar: aplica `ban_duration: "876600h"` via Supabase Admin API — bloqueia login
- **Definir Senha GM** (botão violet): modal manual com input + validação de regras (mín 8, maiúscula, número, especial)
- **Reset Padrão** (botão orange, disponível para GM e player): seta senha para `12345` + `user_metadata.requires_password_change = true`; no próximo login é exibido modal obrigatório para troca de senha seguindo as regras; após confirmar grava `requires_password_change: false` via `supabase.auth.updateUser`
  - **Player**: modal de troca aparece no `DashboardView`
  - **GM**: modal de troca aparece no `MasterPanelView` (verificado no `onMounted`)
- **Supabase Auth display_name**: todo usuário criado recebe `user_metadata.display_name = username` para identificação no dashboard Supabase. Migration 031 preencheu os existentes.

## Fluxo de Auth

1. Supabase Auth no frontend
2. `AuthMeta` no localStorage: `activeCharacterId`, `isMaster`, `authenticatedAt`
3. Sessão expira em 24h (verificado no router guard e no store)
4. Axios interceptor envia `Authorization: Bearer <token>` para o backend
5. Backend valida token no Supabase

## Fluxo de Criação de Personagem

1. Jogador acessa `/` (LoginView) e abre modal "Criar Novo Personagem"
2. Preenche: avatar (obrigatório, comprimido canvas + sharp), nome + sobrenome, email (deve estar na whitelist), username (3-20 chars, a-z0-9_-), senha (mín 8, maiúscula, número, especial), gênero (VSelect → `genero`), índole (VSelect → `indole`), aparência física (**mín 100 letras** sem espaços), história (**mín 1000 letras** OU arquivo Word/PDF)
3. **Bypass de teste**: incluir o texto `"mas a bicicleta e azul"` na aparência ou história pula as validações de tamanho mínimo (frontend + backend)
4. Frontend faz upload do avatar para `character-avatars/pending/` via `POST /upload-avatar` (público)
5. Frontend submete `POST /character-creation-requests` — sem auth, backend valida whitelist + unicidade de username + regras
   - **Atenção:** a API `submeterSolicitacaoCriacao` mapeia camelCase → snake_case antes de enviar (ex: `aparenciaFisica → aparencia_fisica`)
6. Jogador vê tela "Aguardando aprovação do mestre" — **sem login automático**
7. Mestre vê bell com contagem em `/master` e acessa `/master/logins`
8. Mestre aprova: backend cria usuário Supabase Auth (`{username}@rpg.internal`) + `display_name = username` + registro em `characters` + registro em `usuarios`
9. Mestre rejeita: preenche motivo (opcional)

## Fluxo de Onboarding (primeiro login do player)

Após aprovação, o player loga e passa pelo onboarding antes de acessar o dashboard.
Ordem das etapas: **Raça → Classe → Passado → Atributos → Deuses → Equipamentos**

Todas as 6 etapas estão implementadas em `OnboardingView.vue`.

| Etapa | Endpoint | Permanente? | Notas |
|---|---|---|---|
| 1 — Raça | `PATCH /api/personagens/:id/escolher-raca` | Sim | Atualiza `characters.raca_id` |
| 2 — Classe | `PATCH /api/personagens/:id/escolher-classe-inicial` | Sim | Salva em `data.classes` |
| 3 — Passado | `PATCH /api/personagens/:id/escolher-passado` | Sim | Atualiza `characters.passado_id`; concede skills/títulos do passado |
| 4 — Atributos | `PATCH /api/personagens/:id/definir-atributos` | Sim | Salva em `data.atributos` |
| 5 — Deus | `PATCH /api/personagens/:id/escolher-deus` | Sim | Atualiza `characters.deus_id`; pode ser pulado |
| 6 — Equipamentos | `PATCH /api/personagens/:id/concluir-onboarding` | — | Salva `data.equipamentos_iniciais`; seta `onboarding_completo = true` |

**Navegação entre etapas:** o player pode transitar livremente entre as etapas já concluídas usando o stepper no topo. `etapaMaxima` controla quais etapas são clicáveis. Ao concluir a etapa 6, é redirecionado para `/dashboard`.

**Capacidade de carga (etapa 6):** `pesoMaximo = atributos.forca * 2`. Backend valida na conclusão do onboarding.

**Gear menu:** botão de engrenagem fixo no topo direito do onboarding permite sair/fazer logout.

**`DashboardView`** detecta `onboardingCompleto === false` e redireciona para `/onboarding`. Mestres nunca são redirecionados.

## Status do Personagem

- Campo `characters.status TEXT DEFAULT 'vivo' CHECK (status IN ('vivo', 'morto'))` (migration 043)
- Mestre pode alterar em `/master/usuarios` (botão por linha) e em `/master` (grade de personagens)
- Badge "Morto" aparece no **portrait sidebar** do `DashboardView` quando `status === 'morto'`
- **Ao marcar como morto:** backend remove automaticamente registros de `classe_secreta_revelada`, liberando as classes secretas para outros personagens
- Personagens mortos **não aparecem** na lista de seleção ao revelar uma classe secreta
- Endpoint: `PATCH /api/personagens/admin/:id/status` → `{ status: 'vivo' | 'morto' }` (isMaster)

## Classes Secretas

- Coluna `classes.is_secret BOOLEAN DEFAULT FALSE` (migration 042)
- Gerenciadas em `/master/classes-secretas` (`MasterClassesSecretasView.vue`)
- Card no painel master (`/master`) com link direto para a tela
- **Regras:**
  - Só um personagem **vivo** pode deter cada classe secreta por vez (`UNIQUE classe_id` em `classe_secreta_revelada`)
  - Se outro player desbloqueou e pegou, a classe some para o primeiro (que ainda não confirmou)
  - Revelação manual pelo mestre: seleciona classe → seleciona personagem (só vivos aparecem)
  - Revelação automática por requisitos: o mestre também pode fazer isso via a tela
  - Morte do personagem → classe liberada automaticamente
- **Títulos vinculados:** `titles.classe_secreta_id` referencia uma classe secreta; o título fica invisível para players sem aquela classe revelada

## Dashboard (DashboardView)

O dashboard do player exibe todas as informações selecionadas no onboarding:

**Tab "Personagem":**
- Visão geral: nível, pontos de classe, índole
- Classes do personagem
- **Atributos** (após onboarding): barras coloridas para Aura, Força, Destreza, Resistência, Inteligência
- **Origem**: cards com raça, passado e deus (carregados via APIs públicas em background)
- Skills e títulos concedidos
- Notas de aventura (preview)

**Tab "Inventário":**
- **Equipamentos do onboarding** (`data.equipamentos_iniciais`): lista com peso por item
- **Barra de capacidade de carga**: verde < 70%, âmbar 70–90%, vermelho ≥ 90%. Fórmula: `Força × 2`
- Inventário geral (itens livres, sem peso) com mochila rápida (dropdown)

## Storage (Supabase)

- Avatar: bucket `character-avatars` (`VITE_AVATAR_BUCKET`) — uploads pendentes em `pending/`, aprovados movidos para raiz
- História: bucket `character-history` (`VITE_HISTORY_BUCKET`)

## Backup de Imagens

Tela `/master/imagens` (`MasterImagesView.vue`) mostra todas as imagens do projeto em 4 seções: Personagens, Deuses, Mapas, Raças. Cada imagem tem botão de download individual. Cada seção tem "Baixar tudo" que gera um ZIP com pasta nomeada (ex: `DEUSES.zip/DEUSES/`). Botão global "Baixar tudo" gera `IMAGENS.zip` com subpastas para cada seção. Usa JSZip no browser.
