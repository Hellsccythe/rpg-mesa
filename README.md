# RPG de Mesa — Caminho Sem Volta

Sistema de gestão de sessões de RPG de mesa. Monorepo com **Yarn 4 Workspaces**.

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
│   └── migrations/  # Migrations SQL (001–027)
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
2. Preenche avatar, nome, e-mail (deve estar na whitelist), username, senha, gênero, índole, aparência física e história
3. Frontend faz upload do avatar → `POST /api/character-creation-requests/upload-avatar`
4. Frontend submete `POST /api/character-creation-requests` (sem auth)
5. Jogador vê tela **"Aguardando aprovação do mestre"**
6. Mestre vê notificação em `/master` e acessa `/master/logins`
7. Mestre **aprova**: backend cria usuário no Supabase Auth + registro em `characters` + registro em `usuarios`
8. Mestre **rejeita**: preenche motivo opcional

## Fluxo de Onboarding (pós-aprovação)

Ao fazer o primeiro login, o jogador é redirecionado automaticamente para o fluxo de onboarding:

| Passo | Tela | Status |
|---|---|---|
| 1 | Raça | Implementado (`/onboarding`) |
| 2 | Passado | A implementar |
| 3 | Classes | A implementar |
| 4 | Atributos | A implementar |
| 5 | Deuses | A implementar |
| 6 | Equipamentos | A implementar |

O `DashboardView` detecta `character.racaId === null` e redireciona jogadores não-mestres para `/onboarding`. A escolha de raça é **permanente** e não pode ser alterada.

## Gerenciamento de Usuários

Acessível em `/master/usuarios`. O mestre pode:

- Visualizar todos os usuários (tipo, e-mail real, username, personagem vinculado)
- **Editar** tipo (`gm`/`player`), username e nome do personagem
- **Resetar senha** com validação das regras (mín. 8 chars, maiúscula, número, especial)
- **Ativar / Desativar** conta (ban no Supabase Auth)

## Banco de Dados

Migrations em `database/migrations/` (001–027). Schema atual em `docs/SCHEMA_CURRENT.sql`.

Convenções importantes:
- PKs são `INTEGER IDENTITY` (migrations 022–023 converteram de UUID)
- Colunas `user_id` que referenciam `auth.users` permanecem UUID
- Colunas de auditoria `created_by`, `updated_by`, `deleted_by` armazenam **e-mail** (TEXT)
- **Sem FOREIGN KEY constraints** — referências entre tabelas são por convenção de inteiro

## Deploy

O frontend é deployado no Vercel via `vercel.json`. O backend pode ser deployado em qualquer serviço Node.js (Railway, Render, Fly.io, etc.).
