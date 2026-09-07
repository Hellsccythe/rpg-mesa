# RPG de Mesa — Caminho Sem Volta

Sistema de gestão de sessões de RPG de mesa. Monorepo com Yarn 4 Workspaces.

## Stack

- **Frontend (`client/`):** Vue 3 + Vite + Pinia + Vue Router + Axios + Tailwind CSS
- **Backend (`server/`):** NestJS 12 + TypeScript + Sequelize (`sequelize-typescript`) + class-validator/class-transformer
- **Auth:** JWT próprio (bcrypt em `usuarios.password_hash`) — ver "Fluxo de Auth"
- **DB:** PostgreSQL 18 em Docker (`docker-compose.yml`), porta 5433
- **Storage:** disco local em `uploads/`, servido em `/uploads/`
- **Deploy:** Frontend no Vercel (`vercel.json`), backend separado

## Env Vars

**Client:** `VITE_API_BASE_URL`, `VITE_GM_AVATAR_URL`

**Server:** `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN_SEGUNDOS`, `UPLOADS_DIR`, `PUBLIC_BASE_URL`, `ALLOWED_ORIGIN`

As variáveis do Supabase e `MASTER_EMAILS` saíram: não há mais nenhum código que as leia.

## Rotas do Frontend

A raiz **não é mais o login**: `/` lista as campanhas (mundos) e cada uma leva ao seu próprio login em `/mundo/:slug`. `/login` continua existindo como entrada direta, sem campanha.

| Rota | View | Auth |
|---|---|---|
| `/` | WorldsView | pública |
| `/mundo/:slug` | LoginView | pública |
| `/login` | LoginView | pública |
| `/dashboard?characterId=` | DashboardView | auth |
| `/onboarding?characterId=` | OnboardingView | auth (player) |
| `/deuses` | DeusesView | pública |
| `/cidade` | CidadeView | auth |
| `/classes` | ClassesView | auth |
| `/skills` | SkillsView | auth |
| `/titulos` | TitulosView | auth |
| `/racas` | RacasView | auth |
| `/equipamentos` | EquipamentosView | auth |
| `/npcs` | NpcsView | auth |
| `/notas` | NotasView | auth |
| `/master` | MasterPanelView | auth + isMaster |
| `/master/deuses` | MasterGodsView | auth + isMaster |
| `/master/mapas` | MasterMapsView | auth + isMaster |
| `/master/personagens` | MasterCharactersView | auth + isMaster |
| `/master/equipamentos` | MasterWeaponsView | auth + isMaster |
| `/master/racas` | MasterRacasView | auth + isMaster |
| `/master/classes` | MasterClassesView | auth + isMaster |
| `/master/classes-secretas` | MasterClassesSecretasView | auth + isMaster |
| `/master/skills` | MasterSkillsView | auth + isMaster |
| `/master/skill-overrides` | MasterSkillOverridesView | auth + isMaster |
| `/master/skill-niveis` | MasterSkillNiveisView | auth + isMaster |
| `/master/titulos` | MasterTitulosView | auth + isMaster |
| `/master/passados` | MasterPassadosView | auth + isMaster |
| `/master/npcs` | MasterNpcsView | auth + isMaster |
| `/master/progressao` | MasterProgressaoView | auth + isMaster |
| `/master/campanhas` | MasterCampanhasView | auth + isMaster |
| `/master/telas` | MasterTelasView | auth + isMaster |
| `/master/tabelas-acessorias` | MasterTabelasAcessoriasView | auth + isMaster |
| `/master/logins` | MasterLoginRequestsView | auth + isMaster |
| `/master/usuarios` | MasterUsersView | auth + isMaster |
| `/master/imagens` | MasterImagesView | auth + isMaster |

## API Endpoints do Backend

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/personagens` | auth |
| GET | `/api/personagens/:id` | auth (mestre abre qualquer um; jogador só o seu) |
| GET | `/api/racas` | público (sem `lore`) |
| GET | `/api/racas/admin` | isMaster (com `lore`) |
| POST | `/api/racas/admin` | isMaster |
| PATCH | `/api/racas/admin/:id` | isMaster |
| DELETE | `/api/racas/admin/:id` | isMaster (soft delete) |
| POST | `/api/racas/admin/upload-image` | isMaster (multipart `file`) |
| GET | `/api/gods` | público |
| GET | `/api/city-maps` | auth |
| GET | `/api/classes` | público |
| GET | `/api/titulos/catalogo` | público (enriquecido com os nomes das skills) |
| POST | `/api/titulos/admin` | isMaster |
| PATCH | `/api/titulos/admin/:id` | isMaster |
| DELETE | `/api/titulos/admin/:id` | isMaster (soft delete) |
| POST | `/api/titulos/admin/personagens/:characterId` | isMaster (concede título avulso) |
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
| GET | `/api/skills/naturezas` | público |
| POST/PATCH/DELETE | `/api/skills/naturezas/admin[/:item]` | isMaster |
| GET | `/api/skills/niveis?skill_id=X` | público (evoluções de nível 2 e 3 da skill) |
| POST | `/api/skills/admin/niveis` | isMaster |
| PATCH | `/api/skills/admin/niveis/:id` | isMaster |
| DELETE | `/api/skills/admin/niveis/:id` | isMaster (**hard delete** — UNIQUE total) |
| POST | `/api/skills/admin/personagens/:characterId` | isMaster (concede skill avulsa a um personagem) |
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
| GET | `/api/classes/para-player?characterId=X` | auth — só o dono do personagem ou o mestre (retorna normais + secretas reveladas) |
| GET | `/api/classes/level-progression` | auth (mesma tabela de `/personagens/admin/level-progression`, que é isMaster) |
| GET | `/api/classes/progressao?classe_id=X` | isMaster (XP por nível dentro de uma classe) |
| POST | `/api/classes/progressao/admin` | isMaster |
| POST | `/api/classes/progressao/admin/bulk` | isMaster |
| PATCH | `/api/classes/progressao/admin/:id` | isMaster |
| DELETE | `/api/classes/progressao/admin/:id` | isMaster (**hard delete** — ver nota abaixo) |
| GET | `/api/classes/secretas/admin` | isMaster (lista classes secretas com titular atual) |
| POST | `/api/classes/secretas/admin/revelar` | isMaster (revela classe secreta a um personagem) |
| DELETE | `/api/classes/secretas/admin/revogar/:classeId` | isMaster (revoga acesso) |
| POST | `/api/personagens/:id/escolher-classe` | auth (adquire classe nova, gasta 1 ponto de classe) |
| POST | `/api/personagens/:id/levar-classe` | auth (converte 1 ponto de classe em 1 ponto de skill) |
| PATCH | `/api/personagens/:id/distribuir-pontos-atributo` | auth |
| PATCH | `/api/personagens/:id` | auth — dono ou mestre |
| PATCH | `/api/personagens/:id/solicitacao` | auth (pede alteração que o mestre revisa) |
| GET | `/api/personagens/admin/solicitacoes` | isMaster |
| POST | `/api/personagens/admin/solicitacoes/:id/revisar` | isMaster |
| POST | `/api/personagens/admin/:id/class-points` | isMaster |
| POST | `/api/personagens/admin/:id/skill-points-classe` | isMaster |
| POST | `/api/personagens/admin/:id/atribuir-pontos-atributo` | isMaster |
| POST | `/api/personagens/admin/:id/resetar-pontos-atributo` | isMaster |
| PATCH | `/api/personagens/admin/:id/atribuir-xp` | isMaster (XP numa classe) |
| PATCH | `/api/personagens/admin/:id/atribuir-xp-personagem` | isMaster (XP do personagem) |
| PATCH | `/api/personagens/admin/:id/god-info/:godId` | isMaster |
| PATCH | `/api/personagens/admin/:id/avatar-focal-point` | isMaster |
| PATCH | `/api/personagens/admin/:id/modal-hero-position` | isMaster |
| POST | `/api/personagens/admin/personagens/:id/notas` | isMaster (nota de aventura) |
| DELETE | `/api/personagens/admin/:id` | isMaster (soft delete + apaga o avatar do disco) |
| PATCH | `/api/personagens/admin/:id/status` | isMaster (vivo \| morto; morte libera classe secreta) |
| GET | `/api/campanhas` | público (só as ativas) |
| GET | `/api/campanhas/:slug` | público |
| GET | `/api/campanhas/admin/listar` | isMaster (inclui inativas) |
| POST | `/api/campanhas/admin` | isMaster |
| PATCH | `/api/campanhas/admin/:id` | isMaster |
| DELETE | `/api/campanhas/admin/:id` | isMaster (soft delete, 204) |
| POST | `/api/campanhas/admin/upload-capa` | isMaster (multipart `file`) |
| GET/POST | `/api/campanhas/admin/:id/gms` | isMaster |
| DELETE | `/api/campanhas/admin/:id/gms/:gmId` | isMaster (soft delete, 204) |
| GET | `/api/npcs/admin` | isMaster |
| POST | `/api/npcs/admin` | isMaster |
| PATCH | `/api/npcs/admin/:id` | isMaster |
| DELETE | `/api/npcs/admin/:id` | isMaster (soft delete) |
| POST | `/api/npcs/admin/upload-image` | isMaster (multipart `file`) |
| GET | `/api/npcs/admin/:id/acessos` | isMaster (todos os personagens, marcando quem tem acesso) |
| POST/DELETE | `/api/npcs/admin/:id/acessos/:characterId` | isMaster (**hard delete** — UNIQUE total) |
| GET | `/api/npcs/player?characterId=X` | auth — só o dono do personagem ou o mestre |
| GET | `/api/lore-notes?characterId=X` | auth — só o dono do personagem ou o mestre |
| GET | `/api/lore-notes/admin` | isMaster |
| POST | `/api/lore-notes/admin` | isMaster |
| PATCH | `/api/lore-notes/admin/:id` | isMaster |
| DELETE | `/api/lore-notes/admin/:id` | isMaster (soft delete, 204) |
| GET | `/api/player-telas/disponiveis` | público (lista fixa das telas liberáveis) |
| GET | `/api/player-telas/me?characterId=X` | auth — só o dono do personagem ou o mestre |
| GET | `/api/player-telas/admin/:characterId` | isMaster |
| PUT | `/api/player-telas/admin/:characterId` | isMaster (substitui o conjunto inteiro) |
| GET | `/api/admin/exportar-schema?dialeto=postgresql\|mysql\|sqlite` | isMaster (devolve texto puro como anexo) |

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

Schema completo em `docs/SCHEMA_CURRENT.sql` — **arquivo gerado por `pg_dump --schema-only`, não editado a mão**; regere-o quando mexer no esquema (o comando está no cabeçalho do próprio arquivo). Migrations em `database/migrations/` (001–070). Documentação em PDF, com as ligações entre tabelas e os fluxos: `docs/BANCO_DE_DADOS.pdf`.

**Não sobrou nenhum UUID no banco.** As migrations 022–023 converteram as PKs para `INTEGER IDENTITY`, e a **061** terminou o serviço nas colunas que ainda referenciavam o Supabase Auth: `characters.user_id` hoje é `INTEGER` apontando para `usuarios.id`, e `characters.campaign_id` é `INTEGER` apontando para `campaigns.id`. A coluna `usuarios.auth_user_id` foi removida.

**Migration 027:** `created_by`, `updated_by`, `deleted_by` viraram TEXT e guardam o **email** de quem fez a ação. Não há helper a chamar — os **hooks globais do Sequelize** (`server/src/common/database/auditoria.hooks.ts`) preenchem sozinhos, lendo o usuário autenticado do `AsyncLocalStorage`. Isso vale para escrita pelo ORM; `sequelize.query` cru **não** dispara hook nenhum, então quem escreve em SQL passa o autor na mão.

**Migration 070:** a 027 trocou o tipo da coluna mas não converteu os dados — 214 linhas seguiam com o UUID do `auth.users`. A 070 fez o de-para para email. Sobrou um UUID em `characters.deleted_by` que nunca teve conta correspondente.

**Referências entre tabelas são sempre por convenção de inteiro — nunca usar FOREIGN KEY constraints no banco.** O preço disso é que nada impede um órfão: apagar um registro referenciado não dá erro, deixa a referência apontando para o vazio. Quem apaga é responsável por limpar (ver "Integridade de Dados").

### `usuarios` (migration 027)

Contas de acesso ao sistema. Criada ao aprovar uma solicitação (players) ou seed manual (GMs).

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| real_email | TEXT | NOT NULL — email real do jogador ou GM |
| username | TEXT | nullable — login handle do jogador; GM entra pelo email |
| tipo | TEXT | NOT NULL, default `'player'` — CHECK `'gm'` \| `'player'` |
| ativo | BOOLEAN | NOT NULL, default TRUE — o login recusa quem está inativo |
| password_hash | TEXT | bcrypt. **Nulo = pré-registro** (migration 065) |
| requires_password_change | BOOLEAN | NOT NULL, default FALSE — força o modal de troca no próximo login |
| created_at / updated_at | timestamptz | |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |

`auth_user_id` foi removida na migration 061. `password_hash` chegou na 062, quando o backup do Supabase veio sem o cofre de senhas do Auth: as 7 contas existentes receberam `12345` com `requires_password_change = true`.

**Não há UNIQUE em `username` nem em `real_email`** — a unicidade é garantida só no código (`garantirUsernameLivre`). Duas inserções simultâneas passariam.

Endpoints: `GET/PATCH /api/usuarios/admin`, `PATCH /api/usuarios/admin/:id/resetar-senha`, `PATCH /api/usuarios/admin/:id/ativo`.
Tela: `/master/usuarios` → `MasterUsersView.vue`.

### `characters`

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY (migration 022) |
| user_id | INTEGER | NOT NULL — referência a `usuarios.id` (migration 061, antes UUID de `auth.users`) |
| campaign_id | INTEGER | nullable — referência a `campaigns.id` |
| name | text | NOT NULL |
| username | text | cópia do `usuarios.username`, para exibição. UNIQUE **parcial** (`WHERE deleted_at IS NULL`) |
| level | integer | NOT NULL, default 1 |
| data | jsonb | NOT NULL, default `{}` — ver abaixo |
| avatar_url | text | nullable — **caminho relativo** (`personagens/inari.png`) |
| raca_id | INTEGER | referência a `racas.id` — null até escolha no onboarding |
| classe_id | INTEGER | referência a `classes.id` — a classe inicial; as demais ficam em `data.classes` |
| passado_id | INTEGER | referência a `passados.id` — null até escolha no onboarding |
| deus_id | INTEGER | referência a `gods.id` — null se o player pulou a etapa |
| onboarding_completo | BOOLEAN | NOT NULL, default FALSE — falso redireciona para `/onboarding` |
| status | TEXT | NOT NULL, default `'vivo'` — CHECK `'vivo'` \| `'morto'` (migration 043) |
| indole_id | INTEGER | referência a `indole.id` (migration 024) |
| genero_id | INTEGER | referência a `genero.id` (migration 025) |
| aparencia_fisica | text | nullable |
| historia_texto | text | nullable |
| historia_doc_url | text | nullable — caminho relativo |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete (migration 027: deleted_by agora é TEXT/email) |
| created_by / updated_by | TEXT | email do autor (migration 027, antes UUID) |

**O `data` é onde mora metade da ficha.** Não tem esquema declarado em lugar nenhum, então vale listar o que se grava lá:

| Chave | O que é |
|---|---|
| `atributos` | a soma usada em jogo (base + bônus do passado) |
| `atributos_base` | o que o jogador distribuiu no onboarding |
| `atributos_bonus_passado` | a parcela vinda do passado |
| `classes` | `[{name, nivel, xp, skillPoints}]` — a progressão por classe |
| `classPoints` | pontos de classe não gastos |
| `skills` / `titles` | skills e títulos concedidos ao personagem |
| `equipamentos_iniciais` | escolha da etapa 6, com peso |
| `inventario` | itens livres, sem peso |
| `adventureNotes` | notas de aventura escritas pelo mestre |
| `pendingChangeRequest` | pedido de alteração aguardando revisão (índice parcial em cima) |
| `avatarFocalPoint` / `modalHeroPosition` | enquadramento da imagem, ajustado pelo mestre |
| `xp` | XP do personagem (distinto do XP por classe) |
| `deusEtapaConcluida` | marca a etapa 5 como vista, mesmo se pulada |

**Cuidado:** `PATCH /api/personagens/:id` **substitui o `data` inteiro**. Mandar um objeto parcial apaga o resto sem aviso.

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
| password_hash | TEXT | **hash bcrypt**. Era AES-256-CBC reversível porque o texto puro era necessário para criar a conta no Supabase Auth; hoje a conta nasce no próprio backend e o hash é só transferido para `usuarios.password_hash` na aprovação — a senha deixou de ser recuperável a partir do banco |
| nome | TEXT | nome completo do personagem |
| avatar_url | TEXT | nullable — caminho relativo em `uploads/pendentes/` |
| indole_id | INTEGER | referência a `indole.id` |
| genero_id | INTEGER | referência a `genero.id` |
| aparencia_fisica | TEXT | mínimo 30 letras sem espaços |
| historia_texto | TEXT | nullable — mínimo 100 letras ou doc obrigatório |
| historia_doc_url | TEXT | nullable — caminho relativo em `uploads/pendentes/` |
| status | TEXT | 'pendente' \| 'aprovado' \| 'rejeitado' |
| rejeitado_motivo | TEXT | nullable |
| revisado_em / revisado_por | timestamptz / TEXT | auditoria de revisão (email do mestre) |
| campaign_id | INTEGER | nullable |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |
| created_at / updated_at | timestamptz | |

Ao aprovar: cria (ou preenche o pré-registro de) `usuarios` com o hash já pronto → cria registro em `characters`. Se a criação do personagem falhar, a conta recém-criada é desfeita para não ficar órfã.

`username` é único **apenas entre solicitações pendentes ou aprovadas** (índice parcial, migration 069). Uma rejeitada libera o nome para o jogador reenviar. Antes o índice era total e o reenvio estourava com chave duplicada.

O email precisa estar **pré-registrado**: um `usuarios` com `password_hash` nulo. A checagem antiga procurava `auth_user_id IS NULL`, coluna removida na migration 061 junto com o Supabase Auth — o que quebrava toda submissão.

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
| categoria_equipamento_item | INTEGER | referência **única** a `categoria_equipamento.item` (nullable) |
| classe_equipamento_item | INTEGER[] | array de referências a `classe_equipamento.item` (NOT NULL, default `'{}'`) |
| tipo_equipamento_item | INTEGER[] | array de referências a `tipo_equipamento.item` |
| propriedade_equipamento_item | INTEGER[] | array de referências a `propriedade_equipamento.item` |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |
| created_at / updated_at | timestamptz | |
| created_by / updated_by | TEXT | auditoria (email) |

`dano` é **NOT NULL**: item que não é arma grava string vazia, nunca null.

**Cuidado com a assimetria:** categoria é **uma só** (coluna `integer`), enquanto classe, tipo e propriedade são **listas** (`integer[]`). É fácil inverter — esta documentação descrevia o contrário até a migração do módulo.

### `categoria_equipamento`

O nível de cima da hierarquia. Ex: "Armadura", "Armas", "Cura".

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | sequence própria no banco (`categoria_equipamento_item_seq`) |
| descricao | VARCHAR(100) | |
| icone | VARCHAR(100) | nullable |
| classe_item | INTEGER | nullable — praticamente sem uso |
| created_at / updated_at | timestamptz | |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |
| created_by / updated_by | TEXT | auditoria |

Categorias seed: 1=Armadura, 2=Exploração, 3=Cura, 4=Cosmético, 5=Utilitário, 6=Armas.

### `classe_equipamento` (migration 015)

Dimensão independente, não é pai de ninguém. Ex: "Simples", "Marcial", "Exótica", "Couro".

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | sequence própria |
| descricao | VARCHAR(100) | |
| soft delete / auditoria | — | padrão |

### `tipo_equipamento` e `propriedade_equipamento` (migration 015)

Filhos de **`categoria_equipamento`** via `categoria_item`. Ex de tipo: "Corpo a corpo", "Longo alcance". Ex de propriedade: "Ágil", "Área". Estrutura idêntica entre as duas.

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | sequence própria |
| descricao | VARCHAR(100) | |
| categoria_item | INTEGER | referência a `categoria_equipamento.item` |
| soft delete / auditoria | — | padrão |

As duas também têm uma coluna `classe_item`, herdada da modelagem original: está vazia em todas as linhas e nenhum código lê ou escreve. Não é mapeada nos models.

**O `item` vem da sequence do banco.** A versão Express calculava `MAX(item)+1` numa consulta à parte, o que gastava duas idas ao banco por inserção, deixava duas criações simultâneas escolherem o mesmo número e nunca avançava a sequence.

### Sequences dessincronizadas (migration 067)

O ponto acima deixou um estrago silencioso: como ninguém chamava as sequences, várias ficaram paradas no início enquanto os dados avançavam. Enquanto todo módulo escolhia a chave na mão isso não aparecia — ao migrar para o Sequelize, que deixa o banco gerar a chave, a primeira inserção estoura com `duplicate key value violates unique constraint`. Aconteceu em `skill_tipo_dano`, cuja sequence estava em 1 com registros até o item 8.

A migration 067 percorre toda sequence ligada a uma coluna e a adianta para o maior valor gravado. **Rode-a de novo antes de migrar qualquer módulo que ainda escolha chave na mão** — é idempotente.

Cuidado ao escrever essa checagem: uma sequence nunca usada (`is_called = false`) devolve o próprio `last_value` no primeiro `nextval`, e não `last_value + 1`. Comparar só o `last_value` com o máximo deixa passar exatamente esse caso — foi o que aconteceu com `categoria_arma` na primeira versão da migration.

### RLS — nota geral

42 tabelas estão com `ROW LEVEL SECURITY` ligado, herança do Supabase, mas quase todas sem policy nenhuma. O app só funciona porque `rpg_app_user` tem `BYPASSRLS`. Com a autorização agora nos guards do Nest, o RLS não é mais a camada de segurança — mas continua sendo uma armadilha: qualquer conexão com um papel sem `BYPASSRLS` veria a maioria das tabelas vazia e não conseguiria escrever.

### `character_creation_whitelist` — **morta**

Era a lista de e-mails autorizados a submeter solicitação de criação. **Nenhum código lê ou escreve nela.** A autorização virou o pré-registro em `usuarios` (linha com `password_hash` nulo), checado por `garantirEmailPreAutorizado`. As 5 linhas continuam no banco e a tabela ainda aparece nos tipos do frontend; a mensagem de erro do `LoginView` ainda fala em "whitelist". Candidata a remoção.

### `skills`

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY (migration 022) |
| name | VARCHAR(100) | obrigatório |
| description | TEXT | **NOT NULL** — sem descrição grava string vazia, nunca null |
| raca_vinculada | TEXT[] | array de nomes de raças (migration 046 — era VARCHAR(100)) |
| skill_tipo_item | INTEGER | referência a `skill_tipo.item` (migration 020) |
| skill_categoria_item | INTEGER[] | array de referências a `skill_categoria.item` (migration 046 — era INTEGER) |
| skill_tipo_dano_item | INTEGER[] | array de referências a `skill_tipo_dano.item` (migration 046 — era INTEGER) |
| skill_natureza_item | INTEGER | referência a `skill_natureza.item` (Ativa, Passiva, Assinatura) |
| multiplicador_atributo | **TEXT[]** | lista plana de expressões que escalam o dano, ex: `{"2d8 + Destreza"}` (migration 047 — renomeado de damage_display) |
| nivel_minimo_classe | INTEGER | lido pelo DashboardView para travar skill por nível, mas **nulo em todas as linhas** e nenhuma rota escreve — recurso inerte |
| damage_base | TEXT | notação de dado, ex: "1d8", "2d6+3" (migration 047 — era NUMERIC) |
| effect_description | VARCHAR(500) | descrição curta do efeito |
| custo | INTEGER | custo de recurso/mana |
| cooldown | INTEGER | cooldown em turnos |
| range | VARCHAR(60) | alcance, ex: "Toque", "10m" |
| required_class | VARCHAR(100) | ID da classe requerida |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |
| created_by / updated_by | TEXT | auditoria |

A tabela ainda carrega `damage_modifier`, `damage_type`, `cost`, `is_secret` e `required_class_id`, anteriores à migration 047. Nenhum código lê ou escreve, mas as três primeiras têm dados (15, 16 e 31 linhas) e continuam no retorno da API porque a versão anterior fazia `SELECT *`.

**`effect_value` foi removido (migration 047).** O valor é calculado em runtime combinando `damage_base` (dado) com o atributo do personagem em `multiplicador_atributo`.

### `skill_character_override` (migration 048)

Override de skill por personagem. Permite que o mestre configure dano base ou multiplicador diferentes para um player específico. `UNIQUE(skill_name, character_id)`.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| skill_name | TEXT | nome da skill (referência a `characters.data.skills[].name`) |
| character_id | INTEGER | referência a `characters.id` |
| damage_base_override | TEXT | notação de dado sobrescrita, ex: "2d8" |
| multiplicador_override | **TEXT[]** | mesmo formato de `skills.multiplicador_atributo` |
| created_at / updated_at | timestamptz | |
| created_by / updated_by | TEXT | email do mestre |

Gerenciada em `/master/skill-overrides`. API: `GET/POST/PATCH/DELETE /api/skills/admin/overrides[/:id]` (isMaster).

### `skill_tipo`, `skill_categoria`, `skill_tipo_dano` (migration 020)

Tabelas de lookup para skills. Padrão `item INTEGER PK` + `descricao VARCHAR(100)`. Gerenciadas em `/master/skills` abas Tipos/Categorias/Tipos de Dano.

### `gods`, `city_maps`, `classes`, `titles`, `racas`

Tabelas de catálogo gerenciadas pelo mestre. PKs convertidas para INTEGER IDENTITY (migration 022). Todas têm soft delete (`deleted_at`, `deleted_by`) e auditoria (`created_by`, `updated_by`, migration 014).

`gods` tem `indole_id INTEGER` referenciando `indole.id`.

**`racas`** tem `habilidades JSONB` e `atributos_bonus JSONB` (listas de `{nome, descricao}` e `{atributo, valor}`) e `lore TEXT`. O `lore` é o único campo que a listagem pública omite — `GET /api/racas` devolve `lore: null`, e só `GET /api/racas/admin` traz o conteúdo. `foto_url` guarda **caminho relativo** (`racas/elfo.png`); a URL completa é montada na resposta.

**`classes`** tem `is_secret BOOLEAN DEFAULT FALSE` (migration 042). Classes secretas não aparecem no onboarding nem para outros players — só são reveladas pelo mestre através de `/master/classes-secretas`. São exclusivas: apenas um personagem vivo por sessão pode deter cada classe secreta.

`classes.starting_skills` é `text[]` **NOT NULL** com default `'{}'` — gravar `null` viola a constraint (o default só vale quando a coluna é omitida do INSERT). Já `passive_skills` é nullable. `tier` tem CHECK: só `'Base'`, `'Híbrida'` ou `'Hidden'`.

**`titles`** tem `is_hidden BOOLEAN DEFAULT FALSE` (oculta requisitos) e `classe_secreta_id INTEGER DEFAULT NULL` (migration 045). Quando `classe_secreta_id` é preenchido, o título só é visível para players que tiverem essa classe secreta revelada.

`bonuses`, `requirements` e `skill_ids` são **NOT NULL** com default `'{}'` — gravar null viola a constraint.

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

**Soft delete não se aplica a `classe_secreta_revelada` nem a `class_level_progression`.** As duas tabelas têm as colunas `deleted_at`/`deleted_by`, mas os índices únicos (`UNIQUE(classe_id)` e `UNIQUE(classe_id, nivel)`) são totais, não parciais: uma linha soft-deletada continuaria ocupando a chave e impediria recriar aquele registro — com o agravante de o culpado estar invisível na listagem. Revogar uma classe secreta ou apagar um nível de progressão apaga de verdade. Para mudar isso seria preciso antes tornar os índices parciais (`WHERE deleted_at IS NULL`).

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

Notas de lore que o mestre publica. Ver migrations 009–011; PK convertida para INTEGER IDENTITY (migration 022).

`character_id INTEGER` nulo significa nota **global** (todos veem); preenchido, a nota só aparece para aquele personagem. A coluna existia como `uuid` desde a migration 010, sumiu durante a conversão de PKs para INTEGER, e **o backend continuou filtrando e gravando por ela** — o que deixou todas as rotas do módulo quebradas contra o esquema real até a migration 068 devolvê-la. Não apareceu antes porque a tabela está vazia.

`content` é NOT NULL com default `''`.

### `campaigns` e `campaign_gms` (migrations 056–059)

Campanhas — os "mundos" da tela inicial. Cada personagem pertence a uma (`characters.campaign_id`).

`campaigns`: `id`, `slug` (**UNIQUE** — é o que aparece em `/mundo/:slug`), `name`, `description`, `cover_image_url` (caminho relativo), `is_active` (só as ativas aparecem no `GET /api/campanhas` público) + soft delete e auditoria.

`campaign_gms`: liga um `campaign_id` a um `email` de mestre. Sem UNIQUE — nada impede duplicar o mesmo mestre na mesma campanha.

A migration 058 criou a campanha padrão `caminho-sem-volta` e a 059 ligou as solicitações de criação a ela.

### `npcs` e `npc_acesso_player` (migrations posteriores à 059)

`npcs`: `id`, `nome`, `raca_id` (→ `racas.id`), `descricao`, `foto_url` (caminho relativo) + soft delete e auditoria.

`npc_acesso_player`: quais personagens enxergam quais NPCs. `UNIQUE(npc_id, character_id)` **total** — por isso o revogar é **hard delete**, igual a `classe_secreta_revelada`. O player só vê o que estiver listado aqui; o mestre vê tudo.

Telas: `/master/npcs` (gestão + aba de acessos) e `/npcs` (visão do jogador, exige `characterId`).

### `player_telas`

Quais telas do menu cada personagem pode abrir. `UNIQUE(character_id, tela)`.

A lista de telas liberáveis é **fixa no código**, em `TELAS_DISPONIVEIS` (`server/src/modules/player-telas/player-telas.service.ts`), não no banco: `cidade`, `classes`, `deuses`, `equipamentos`, `notas`, `npcs`, `racas`, `skills`, `titulos`. Valor desconhecido é descartado silenciosamente na gravação.

`PUT /api/player-telas/admin/:characterId` **substitui o conjunto inteiro** — apaga tudo e reinsere. Mestre sempre recebe todas as telas, sem consultar a tabela.

Tela: `/master/telas` → `MasterTelasView.vue`.

### `level_progression` (migration 054) e `class_level_progression` (migration 053)

Duas tabelas de XP, com propósitos diferentes — é fácil trocar uma pela outra.

**`level_progression`** é a do **personagem**: `level` (**UNIQUE**), `tier`, `multiplier`, `xp_required_next` e `xp_total_accumulated`. 27 níveis cadastrados. É a tabela que `atribuirXpAoPersonagem` percorre para decidir o nível a partir do XP acumulado. O código-fonte da migração anterior consultava colunas que não existem aqui (`nivel`, `xp_necessario`), então **o XP nunca subia o nível de ninguém** até isso ser corrigido.

**`class_level_progression`** é a do **par classe/nível**: `classe_id`, `nivel`, `xp_necessario`, com `UNIQUE(classe_id, nivel)`. Alimenta a progressão dentro de cada classe em `data.classes[].xp`.

Nas duas o UNIQUE é total, então **soft delete não se aplica** — apagar um nível é hard delete (mesma armadilha descrita em `classe_secreta_revelada`).

Tela: `/master/progressao` → `MasterProgressaoView.vue`.

### `skill_natureza` (migrations 050 e 066)

Lookup de natureza da skill: 1=Ativa, 2=Passiva, 3=Assinatura. Referenciada por `skills.skill_natureza_item`. Padrão `item INTEGER PK` + `descricao`. A 066 converteu o `item` para IDENTITY.

### `skill_niveis` (migration 052)

Evoluções de nível 2 e 3 de uma skill. `UNIQUE(skill_id, nivel)` **total** → o DELETE é **hard**.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| skill_id | INTEGER | referência a `skills.id` |
| nivel | INTEGER | 2 ou 3 |
| damage_multiplier_pct | INTEGER | nullable — bônus percentual de dano |
| nome_override | VARCHAR(100) | nullable — cada campo `*_override` substitui o da skill base quando preenchido |
| damage_base_override | TEXT | nullable |
| multiplicador_override | VARCHAR | nullable |
| effect_description_override | VARCHAR(500) | nullable |

Tela: `/master/skill-niveis` → `MasterSkillNiveisView.vue`.

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
- Backend fala com o Postgres pelo Sequelize. **Leituras com JOIN em SQL cru** (`sequelize.query`); **escritas pelo ORM**, para os hooks de auditoria dispararem
- Soft delete padrão: `deleted_at IS NULL` para registros ativos
- DTOs com `class-validator` no backend; tipos TypeScript no frontend
- A validação roda em **todo** o backend, pelo `ValidationPipe` global (`transform: true, whitelist: true`) — não há mais módulo Express. Historicamente os decorators eram decorativos (nada chamava `validate()`), então **regras herdadas daquela época já nasceram sem nunca ter sido executadas** e algumas estavam erradas: o `@IsUrl` em `racas.foto_url` recusaria os caminhos relativos que hoje se gravam. Ao mexer num DTO antigo, confira se a regra faz sentido em vez de confiar nela
- **URL de arquivo:** o banco guarda caminho relativo; toda resposta que expõe uma imagem precisa passar por `montarUrlPublica`. Esquecer disso não dá erro — devolve o caminho cru e o navegador busca no host errado
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

- **Jogador (tipo `player`):** autenticado, acessa apenas seu personagem no dashboard. Login pelo username.
- **Mestre (tipo `gm`):** acessa `/master`, pode abrir qualquer personagem, gerencia catálogos. Login pelo email real.

Quem é mestre vem de `usuarios.tipo = 'gm'`, que viaja dentro do JWT e é checado pelo `MasterGuard`. A env var `MASTER_EMAILS` **não existe mais** — era uma lista de e-mails em variável de ambiente, o que espalhava a definição de "quem é mestre" por dezenas de arquivos e obrigava a redeploy para promover alguém.

Ambos os tipos têm registro na tabela `usuarios`. Players são criados automaticamente na aprovação.

**Acesso a um personagem** é decidido em um lugar só, `garantirAcessoAoPersonagem` (`server/src/modules/personagem/personagem-acesso.ts`): mestre passa sempre, dono passa, o resto leva `ForbiddenException`. Toda rota que recebe `characterId` do cliente precisa chamá-la — foi assim que quatro rotas que aceitavam qualquer id foram fechadas na migração.

## Gerenciamento de Usuários

- Tela: `/master/usuarios` → `MasterUsersView.vue`
- Funções: listar todos, filtrar por tipo/status, editar username/tipo/nome do personagem, definir ou resetar senha, ativar/desativar conta, liberar/remover pré-registros, deletar
- **Username change** atualiza `usuarios.username` e a cópia em `characters.username`. Não existe mais email sintético `{username}@rpg.internal`: o login usa o próprio username
- **Desativar**: vira `usuarios.ativo = false`. O login já recusa quem está inativo, então a coluna sozinha basta — substituiu o `ban_duration` que era aplicado no Supabase Auth
- **Deletar**: é **soft delete**, no usuário e no personagem. A documentação antiga dizia "hard delete: auth + personagem + storage"; hoje nada é apagado de verdade e **o avatar em disco é preservado**, justamente porque a exclusão é reversível
- **Contas GM são protegidas**: `alterarAtivo` e `deletar` recusam quem tem `tipo = 'gm'`. Só dá para desativar ou apagar player pelo painel
- **Definir Senha GM** (botão violet): modal com input + validação (mín 8, maiúscula, número, especial). Grava o bcrypt e deixa `requires_password_change = false`
- **Reset Padrão** (botão orange, GM e player): senha vira `12345` e `requires_password_change = true`. No próximo login o modal obrigatório de troca aparece
  - **Player**: modal no `DashboardView`
  - **GM**: modal no `MasterPanelView` (verificado no `onMounted`)

## Fluxo de Auth

JWT próprio, emitido pelo backend. Supabase Auth saiu de cena.

1. `POST /api/auth/login` recebe `{ identificador, senha }` — o identificador é o username (jogador) ou o email real (mestre). Senha em bcrypt na coluna `usuarios.password_hash`
2. Resposta: `{ tokenAcesso, tipo, precisaTrocarSenha, usuario }`
3. `localStorage`: `rpg-mesa.token` (o JWT) e `rpg-mesa.auth-meta` (`autenticadoEm`, `idPersonagemAtivo`, `eMestre`, `usuario`)
4. Sessão expira em 24h (verificado no router guard e no store). Não há sessão no servidor: sair é apagar o que está guardado
5. Axios interceptor envia `Authorization: Bearer <token>`; `JwtAuthGuard` valida e publica o usuário no contexto da requisição (AsyncLocalStorage), de onde os hooks do Sequelize tiram `created_by`/`updated_by`/`deleted_by`
6. `GET /api/auth/eu` confirma o token; `PATCH /api/auth/trocar-senha` é a troca da própria senha

`usuarios.password_hash` nulo significa **pré-registro**: o mestre liberou o email, mas a conta ainda não existe — o login recusa.

## Fluxo de Criação de Personagem

**Pré-requisito:** o mestre precisa ter **pré-registrado o email** em `/master/usuarios` (`POST /api/usuarios/admin/pre-registrar`), o que cria uma linha em `usuarios` com `password_hash` nulo. Sem isso a submissão é recusada.

1. Jogador acessa `/` (WorldsView), escolhe o mundo, cai em `/mundo/:slug` (LoginView) e abre o modal "Criar Novo Personagem"
2. Preenche: avatar (obrigatório, comprimido no canvas + sharp no servidor), nome + sobrenome, email (precisa estar pré-registrado), username (3-20 chars, `a-z0-9_-`), senha (mín 8, maiúscula, número, especial), gênero (VSelect → `genero`), índole (VSelect → `indole`), aparência física (**mín 100 letras** sem espaços), história (**mín 1000 letras** OU arquivo Word/PDF)
3. **Bypass de teste**: incluir o texto `"mas a bicicleta e azul"` na aparência ou na história pula as validações de tamanho mínimo (frontend + backend)
4. Frontend sobe o avatar por `POST /api/character-creation-requests/upload-avatar` (público) → grava em `uploads/pendentes/` e devolve a URL
5. Frontend submete `POST /api/character-creation-requests` — sem auth. O backend confere o pré-registro, a unicidade do username e as regras, e **guarda a senha já em bcrypt**
   - **Atenção:** a API `submeterSolicitacaoCriacao` mapeia camelCase → snake_case antes de enviar (ex: `aparenciaFisica → aparencia_fisica`)
6. Jogador vê "Aguardando aprovação do mestre" — **sem login automático**
7. Mestre vê o sino com a contagem em `/master` e abre `/master/logins`
8. Mestre aprova: o backend preenche o pré-registro em `usuarios` **transferindo o hash** já pronto e cria o registro em `characters`. Se a criação do personagem falhar, a conta é desfeita para não ficar órfã
9. Mestre rejeita: preenche o motivo (opcional). O username volta a ficar livre — o índice único é parcial e só cobre `pendente`/`aprovado` (migration 069)

**A senha nunca é recuperável a partir do banco.** Antes era AES-256-CBC reversível, porque o texto puro era necessário para criar a conta no Supabase Auth. Como a conta agora nasce aqui, basta transferir o hash.

## Fluxo de Onboarding (primeiro login do player)

Após aprovação, o player loga e passa pelo onboarding antes de acessar o dashboard.
Ordem das etapas: **Raça → Classe → Passado → Atributos → Deuses → Equipamentos**

Todas as 6 etapas estão implementadas em `OnboardingView.vue`.

| Etapa | Endpoint | Permanente? | Notas |
|---|---|---|---|
| 1 — Raça | `PATCH /api/personagens/:id/escolher-raca` | Sim | Atualiza `characters.raca_id` |
| 2 — Classe | `PATCH /api/personagens/:id/escolher-classe` | Sim | Atualiza `characters.classe_id` e cria a entrada em `data.classes` com 2 pontos de skill |
| 2b — Skill inicial | `POST /api/personagens/:id/escolher-skill-inicial` | Sim | Só aparece se a classe tiver `starting_skills`. Gasta 1 ponto de skill e sobe o nível da classe |
| 3 — Passado | `PATCH /api/personagens/:id/escolher-passado` | Sim | Atualiza `characters.passado_id`. As skills e títulos do passado **não** são copiados para o personagem — o dashboard os lê do catálogo de passados na hora de exibir |
| 4 — Atributos | `PATCH /api/personagens/:id/definir-atributos` | Sim | Salva em `data.atributos` |
| 5 — Deus | `PATCH /api/personagens/:id/escolher-deus` | Sim | Atualiza `characters.deus_id`; pode ser pulado |
| 6 — Equipamentos | `PATCH /api/personagens/:id/concluir-onboarding` | — | Salva `data.equipamentos_iniciais`; seta `onboarding_completo = true` |

**Navegação entre etapas:** o player pode transitar livremente entre as etapas já concluídas usando o stepper no topo. `etapaMaxima` controla quais etapas são clicáveis. Ao concluir a etapa 6, é redirecionado para `/dashboard`.

**Capacidade de carga (etapa 6):** `pesoMaximo = 2 + atributos.forca * 2`, onde `forca` já inclui o bônus do passado. Backend valida na conclusão do onboarding.

**Atributos (etapa 4):** 10 pontos distribuíveis. O `data` guarda as três parcelas separadas — `atributos_base` (o que o jogador distribuiu), `atributos_bonus_passado` e `atributos` (a soma, que é o valor usado em jogo).

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

## Storage (disco local)

Arquivos ficam em `uploads/<subpasta>/<nome>.<ext>` e são servidos em `/uploads/...`. **O banco guarda o caminho relativo** (`gods/pharasma.png`); a URL completa é montada na resposta a partir de `PUBLIC_BASE_URL`.

Subpastas: `gods`, `maps`, `racas`, `passados`, `npcs`, `campanhas`, `lore` (PDF de nota), `personagens` (avatar e história anexados a um pedido de alteração) e `pendentes` (avatar e história de solicitação de criação).

Cada módulo expõe a própria rota de upload — todas exigem mestre, exceto as de `character-creation-requests` (públicas, porque quem submete ainda não tem conta) e as de `personagens/:id/*`, que exigem ser dono do personagem.

Nomes de arquivo são higienizados e recebem sufixo numérico só em colisão real com conteúdo diferente — arquivo idêntico reaproveita o mesmo nome.

## Backup de Imagens

Tela `/master/imagens` (`MasterImagesView.vue`) mostra todas as imagens do projeto em 4 seções: Personagens, Deuses, Mapas, Raças. Cada imagem tem botão de download individual. Cada seção tem "Baixar tudo" que gera um ZIP com pasta nomeada (ex: `DEUSES.zip/DEUSES/`). Botão global "Baixar tudo" gera `IMAGENS.zip` com subpastas para cada seção. Usa JSZip no browser.
