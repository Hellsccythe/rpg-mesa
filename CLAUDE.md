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

Schema completo em `docs/SCHEMA_CURRENT.sql`. Migrations em `database/migrations/` (001–032).

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
| data | jsonb | pendingChangeRequest, historyDocumentPath, adventureNotes, skills, titles, avatarFocalPoint, classPoints |
| avatar_url | text | nullable |
| raca_id | INTEGER | referência a `racas.id` (migration 027) — null até o onboarding |
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
| raca_vinculada | VARCHAR(100) | nome da raça, nullable |
| skill_tipo_item | INTEGER | referência a `skill_tipo.item` (migration 020) |
| skill_categoria_item | INTEGER | referência a `skill_categoria.item` (migration 020) |
| skill_tipo_dano_item | INTEGER | referência a `skill_tipo_dano.item` (migration 020) |
| damage_display | VARCHAR(60) | notação legível, ex: "1d6+2" (migration 021) |
| damage_base | NUMERIC(10,2) | valor numérico base de dano (migration 021) |
| effect_description | VARCHAR(500) | descrição curta do efeito (migration 021) |
| effect_value | NUMERIC(10,2) | valor numérico do efeito (migration 021) |
| custo | INTEGER | custo de recurso/mana (migration 021) |
| cooldown | INTEGER | cooldown em turnos (migration 021) |
| range | VARCHAR(60) | alcance, ex: "Toque", "10m" (migration 021) |
| required_class | VARCHAR(100) | ID da classe requerida (migration 021) |
| deleted_at / deleted_by | timestamptz / UUID | soft delete |
| created_by / updated_by | UUID | auditoria |

### `skill_tipo`, `skill_categoria`, `skill_tipo_dano` (migration 020)

Tabelas de lookup para skills. Padrão `item INTEGER PK` + `descricao VARCHAR(100)`. Gerenciadas em `/master/skills` abas Tipos/Categorias/Tipos de Dano.

### `gods`, `city_maps`, `classes`, `titles`, `racas`

Tabelas de catálogo gerenciadas pelo mestre. PKs convertidas para INTEGER IDENTITY (migration 022). Todas têm soft delete (`deleted_at`, `deleted_by`) e auditoria (`created_by`, `updated_by`, migration 014).

`gods` tem `indole_id INTEGER` referenciando `indole.id`.

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
- Modais de confirmação pequenos usam `panel-class="max-w-sm"` + `tema="escuro"` + `:close-on-backdrop="false"`
- **Toda ação destrutiva ou irreversível nas telas master deve ter modal de confirmação** antes de executar
- Modais de formulário simples (2-3 campos): `max-w-sm`; formulários maiores: `max-w-md` ou `max-w-xl`

## Papéis de Usuário

- **Jogador (tipo `player`):** autenticado, acessa apenas seu personagem no dashboard. Login com `{username}@rpg.internal`.
- **Mestre (tipo `gm` / `isMaster=true`):** acessa `/master`, pode abrir qualquer personagem, gerencia catálogos. Login com email real. Definido via `MASTER_EMAILS` env var.

Ambos os tipos têm registro na tabela `usuarios`. Players são criados automaticamente na aprovação.

## Gerenciamento de Usuários

- Tela: `/master/usuarios` → `MasterUsersView.vue`
- Funções: listar todos, filtrar por tipo/status, editar username/tipo/nome do personagem, reset de senha, ativar/desativar conta, liberar/remover pré-registros, **deletar** (remove auth + personagem + avatar storage)
- Username change atualiza: `usuarios.username` + `characters.username` + email Supabase Auth (`{novo}@rpg.internal`) + `user_metadata.display_name`
- Desativar: aplica `ban_duration: "876600h"` via Supabase Admin API — bloqueia login
- Reset Senha GM: modal manual com validação de regras (mín 8, maiúscula, número, especial)
- Reset Senha Player: seta senha para `12345` + `user_metadata.requires_password_change = true`; no próximo login o DashboardView exibe modal obrigatório para troca de senha seguindo as regras; após confirmar grava `requires_password_change: false` via `supabase.auth.updateUser`
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
Ordem das etapas: **Raça → Passado → Classes → Atributos → Deuses → Equipamentos**

Etapa 1 — Raça (implementada):
1. `DashboardView` carrega o personagem e verifica `character.racaId === null`
2. Se null e não for mestre → redireciona para `/onboarding?characterId=X` (`OnboardingView.vue`)
3. Player vê grid de raças com imagem, descrição, atributos bônus e habilidades
4. Clica em uma raça → tela de confirmação com aviso de escolha permanente
5. Confirma → `PATCH /api/personagens/:id/escolher-raca` atualiza `characters.raca_id`
6. Redireciona para `/dashboard`

Etapa 2 — Passado (catálogo implementado, integração no onboarding pendente):
- Tabela `passados` (migration 032): `id`, `nome`, `descricao`, `foto_url`, `skill_ids[]`, `titulo_ids[]`
- CRUD master em `/master/passados` (`MasterPassadosView.vue`)
- Backend retorna passado enriquecido com `skills: [{id,name}]` e `titulos: [{id,name}]`
- API: `client/src/lib/api/passados.api.ts`
- **Falta:** integrar a escolha de passado no fluxo de onboarding (`OnboardingView.vue` step 2) e vincular à tabela `characters`

Próximas etapas (a implementar): Passado (onboarding step 2), Classes, Atributos, Deuses, Equipamentos.

## Storage (Supabase)

- Avatar: bucket `character-avatars` (`VITE_AVATAR_BUCKET`) — uploads pendentes em `pending/`, aprovados movidos para raiz
- História: bucket `character-history` (`VITE_HISTORY_BUCKET`)

## Backup de Imagens

Tela `/master/imagens` (`MasterImagesView.vue`) mostra todas as imagens do projeto em 4 seções: Personagens, Deuses, Mapas, Raças. Cada imagem tem botão de download individual. Cada seção tem "Baixar tudo" que gera um ZIP com pasta nomeada (ex: `DEUSES.zip/DEUSES/`). Botão global "Baixar tudo" gera `IMAGENS.zip` com subpastas para cada seção. Usa JSZip no browser.
