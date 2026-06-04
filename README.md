# RPG de Mesa — Caminho Sem Volta

Sistema de gestão de sessões de RPG de mesa. Monorepo com **Yarn 4 Workspaces**.

---

## Estado Atual (2026-06-04)

> **Leia esta seção primeiro se estiver retomando o projeto em um novo chat.**

### O que está implementado

| Área | Estado |
|---|---|
| **Criação de personagem** | ✅ Fluxo completo: whitelist, upload avatar, aprovação master, notificação bell |
| **Onboarding** | ✅ Todos os 6 passos: Raça → Classe → Passado → Atributos → Deus → Equipamentos |
| **Navegação onboarding** | ✅ Player pode voltar/avançar entre etapas já concluídas pelo stepper; gear menu com logout |
| **Dashboard** | ✅ Tab Personagem: atributos (barras), origem (raça/passado/deus), classes, skills, títulos |
| **Inventário dashboard** | ✅ Tab Inventário: equipamentos do onboarding com barra de peso (Força × 2), inventário geral + mochila rápida |
| **Gerenciamento de usuários** | ✅ Deletar, reset senha, ativar/desativar, pré-registros, matar/reviver personagem |
| **Status do personagem** | ✅ `vivo` / `morto` — alterável em `/master/usuarios` e grade de `/master`; badge no dashboard |
| **Classes secretas** | ✅ `is_secret` em classes, revelação exclusiva (1 player vivo/vez), tela `/master/classes-secretas` |
| **Títulos vinculados** | ✅ `classe_secreta_id` — título invisível para players sem a classe secreta revelada |
| **Backup de imagens** | ✅ `/master/imagens` com download individual e ZIP por seção/global |
| **Passados (migration 032)** | ✅ CRUD master em `/master/passados`, integração completa no onboarding |

### Onboarding — todos os 6 passos

| Passo | Endpoint | Notas |
|---|---|---|
| 1 — Raça | `PATCH /api/personagens/:id/escolher-raca` | Permanente |
| 2 — Classe | `PATCH /api/personagens/:id/escolher-classe-inicial` | Permanente; só classes normais (`is_secret = false`) |
| 3 — Passado | `PATCH /api/personagens/:id/escolher-passado` | Permanente; concede skills/títulos do passado |
| 4 — Atributos | `PATCH /api/personagens/:id/definir-atributos` | 10 pontos livres para distribuir |
| 5 — Deus | `PATCH /api/personagens/:id/escolher-deus` | Pode ser pulado |
| 6 — Equipamentos | `PATCH /api/personagens/:id/concluir-onboarding` | Limite de peso = Força × 2; conclui onboarding |

### Padrões estabelecidos

- **Confirmação em ações master**: `<Modal panel-class="max-w-sm" tema="escuro" :close-on-backdrop="false">`
- **API camelCase→snake_case**: frontend sempre envia snake_case ao backend
- **Bypass de teste**: `"mas a bicicleta e azul"` em aparência ou história pula validações de tamanho mínimo
- **Cards de catálogo**: padrão com imagem + gradient overlay + chips coloridos por tipo (emerald=skills, amber=títulos)
- **Backend enrichment**: passados e raças retornam dados enriquecidos com nomes resolvidos (não só IDs)
- **Classes secretas**: `is_secret = true` em `classes`; controle de posse em `classe_secreta_revelada`; morte libera automaticamente

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Vue 3 + Vite + Pinia + Vue Router + Axios + Tailwind CSS + Supabase JS |
| Backend | Express 5 + TypeScript + Supabase JS + class-validator / class-transformer |
| Auth / DB / Storage | Supabase (PostgreSQL, Auth, Storage) |
| Deploy | Frontend no Vercel, backend separado |

## Estrutura do Monorepo

```
rpg-mesa/
├── client/          # Frontend Vue 3
├── server/          # Backend Express 5
├── database/
│   └── migrations/  # Migrations SQL (001–032)
├── docs/
│   ├── SCHEMA_CURRENT.sql
│   └── COMPONENTS.md
├── package.json     # Workspace root (Yarn 4)
└── vercel.json
```

## Pré-requisitos

- Node >= 22.18.0
- Yarn 4 (`corepack enable`)
- Projeto Supabase configurado (URL + chaves)

## Variáveis de Ambiente

**`client/.env`**

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3000
VITE_AVATAR_BUCKET=character-avatars
VITE_HISTORY_BUCKET=character-history
VITE_GM_AVATAR_URL=
```

**`server/.env`**

```env
PORT=3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MASTER_EMAILS=email1@exemplo.com,email2@exemplo.com
ALLOWED_ORIGIN=http://localhost:5173
ENCRYPTION_KEY=
```

> `MASTER_EMAILS`: lista separada por vírgulas dos e-mails com acesso de Game Master.
> `ENCRYPTION_KEY`: chave AES-256-CBC usada para criptografar senhas de jogadores nas solicitações de criação.

## Instalação e Execução

```bash
# Instalar dependências (client + server)
yarn install

# Rodar client e server em paralelo
yarn dev

# Somente client
yarn dev:client

# Somente server
yarn dev:server
```

## Build

```bash
yarn build          # client + server
yarn build:client
yarn build:server
```

## Type-check

```bash
yarn type-check          # client + server
yarn type-check:client
yarn type-check:server
```

## Papéis de Usuário

| Tipo | Acesso |
|---|---|
| `gm` | Acesso completo — telas de mestre (`/master/*`), qualquer personagem |
| `player` | Apenas o personagem vinculado ao seu login (`/dashboard?characterId=`) |

Um mesmo e-mail real pode estar vinculado a múltiplos logins de jogador (um por personagem). Os logins de jogador usam e-mail sintético `{username}@rpg.internal` no Supabase Auth; o e-mail real fica em `usuarios.real_email`.

## Fluxo de Criação de Personagem

1. Jogador acessa `/` → abre modal **"Criar Novo Personagem"**
2. Preenche avatar, nome, e-mail (deve estar na whitelist), username, senha, gênero, índole, aparência física (**mín. 100 letras**) e história (**mín. 1000 letras** ou arquivo Word/PDF)
3. Frontend faz upload do avatar → `POST /api/character-creation-requests/upload-avatar`
4. Frontend submete `POST /api/character-creation-requests` (sem auth)
5. Jogador vê tela **"Aguardando aprovação do mestre"**
6. Mestre vê notificação em `/master` e acessa `/master/logins`
7. Mestre **aprova**: backend cria usuário no Supabase Auth + registro em `characters` + registro em `usuarios`
8. Mestre **rejeita**: preenche motivo opcional

## Fluxo de Onboarding (pós-aprovação)

Ao fazer o primeiro login, o jogador é redirecionado automaticamente para `/onboarding`. Todos os 6 passos estão implementados:

**Raça → Classe → Passado → Atributos → Deus → Equipamentos**

O player pode navegar livremente entre etapas já concluídas usando o stepper. Ao finalizar a etapa 6, é redirecionado para o dashboard. Cada escolha é **permanente** — um modal de confirmação é exibido antes de confirmar.

O `DashboardView` detecta `onboardingCompleto === false` e redireciona para `/onboarding`. Mestres nunca são redirecionados.

## Gerenciamento de Usuários

Acessível em `/master/usuarios`. O mestre pode:

- Visualizar todos os usuários (tipo, e-mail real, username, personagem vinculado)
- **Editar** tipo (`gm`/`player`), username e nome do personagem
- **Resetar senha GM**: modal com input e regras de validação
- **Resetar senha Player**: seta para `12345` + obriga troca no próximo login
- **Ativar / Desativar** conta (ban no Supabase Auth)
- **Deletar** conta (remove auth + personagem + avatar do storage)

## Banco de Dados

Migrations em `database/migrations/` (001–045). Schema atual em `docs/SCHEMA_CURRENT.sql`.

Convenções importantes:
- PKs são `INTEGER IDENTITY` (migrations 022–023 converteram de UUID)
- Colunas `user_id` que referenciam `auth.users` permanecem UUID
- Colunas de auditoria `created_by`, `updated_by`, `deleted_by` armazenam **e-mail** (TEXT)
- **Sem FOREIGN KEY constraints** — referências entre tabelas são por convenção de inteiro
- `characters.status TEXT DEFAULT 'vivo'` (migration 043) — `'vivo'` | `'morto'`
- `classes.is_secret BOOLEAN DEFAULT FALSE` (migration 042) — classes exclusivas reveladas pelo mestre
- `classe_secreta_revelada` (migration 044) — controla posse exclusiva de classes secretas
- `titles.classe_secreta_id INTEGER DEFAULT NULL` (migration 045) — vincula título a uma classe secreta

## Classes Secretas

Classes com `is_secret = true` não aparecem no onboarding nem na listagem de classes do player. O mestre as gerencia em `/master/classes-secretas`:

- **Revelar:** seleciona a classe e o personagem destino (apenas vivos). Fica registrado em `classe_secreta_revelada`.
- **Exclusividade:** apenas um personagem vivo pode deter cada classe secreta. Se o player não confirmar e outro desbloquear antes, a classe some para o primeiro.
- **Liberação por morte:** ao marcar um personagem como morto (`/master/usuarios` ou grade de `/master`), todas as suas classes secretas são liberadas automaticamente.
- **Títulos vinculados:** um título com `classe_secreta_id` só aparece para players que tiverem aquela classe secreta revelada.

## Status do Personagem

O mestre pode marcar personagens como **Morto** ou **Vivo**:
- Em `/master/usuarios`: botão na linha de cada player
- Em `/master`: ícone de status na grade de personagens

O badge "Morto" aparece no portrait do dashboard quando o personagem está morto. Personagens mortos não podem receber classes secretas.

## Deploy

O frontend é deployado no Vercel via `vercel.json`. O backend pode ser deployado em qualquer serviço Node.js (Railway, Render, Fly.io, etc.).
