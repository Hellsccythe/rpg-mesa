# Guia de Manutencao

## Fluxo recomendado para mudancas

1. Criar branch de feature/fix.
2. Implementar mudanca no client e/ou server.
3. Rodar checks locais.
4. Validar fluxo manualmente na UI.
5. Atualizar documentacao relevante (`README`, `docs/API.md`, `docs/ARCHITECTURE.md`).

## Convencao de nomes (pt-BR)

Padrao adotado para novas implementacoes e refactors incrementais:

- Variaveis, funcoes e computeds do frontend devem usar nomes em portugues.
- Props de componentes internos devem priorizar nomes em portugues.
- Mantemos nomes em ingles apenas quando vierem de bibliotecas externas ou contratos de API.

Exemplo aplicado:

- Componente `TemaDarkLight`:
  - `elemento`
  - `variante`
  - `clicavel`
  - `tema`
  - `preset`
  - `fonteTitulo`
  - `fonteTexto`
  - valores de `variante`: `contexto`, `painel`, `cartao`, `item`, `aviso`

## Migracao gradual

- A migracao de nomes ingles -> pt-BR sera feita por tela/modulo para reduzir risco.
- Sempre atualizar template, script e estilos no mesmo commit para evitar nomes quebrados.
- Ao concluir cada etapa, registrar no changelog da PR quais arquivos foram padronizados.

## Checks obrigatorios antes de merge

No diretorio raiz:

- `yarn type-check`
- `yarn build`

Checks especificos:

- `yarn type-check:client`
- `yarn type-check:server`
- `yarn build:client`
- `yarn build:server`

## Onde alterar cada funcionalidade

- Login, guardas e sessao:
  - `client/src/stores/auth.ts`
  - `client/src/router/index.ts`
  - `client/src/views/LoginView.vue`

- Personagens (frontend):
  - `client/src/stores/characters.ts`
  - `client/src/lib/api/personagens.api.ts`
  - `client/src/views/DashboardView.vue`

- Fluxo de aprovacao do mestre:
  - `client/src/stores/masterApprovals.ts`
  - `server/src/modules/personagem/personagens.module.ts`
  - `server/src/modules/personagem/personagens.service.ts`

- Catalogo do mestre:
  - `client/src/stores/masterCatalog.ts`
  - `server/src/modules/{god,city_maps,classes,skill,titulos}/*.module.ts`

## Variaveis de ambiente

### Client

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (opcional; default `/api`)
- `VITE_AVATAR_BUCKET` (opcional)
- `VITE_HISTORY_BUCKET` (opcional)
- `VITE_GM_AVATAR_URL` (opcional)

### Server

- `PORT` (default `3000`)
- `SUPABASE_URL` (ou `VITE_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (ou `VITE_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (necessaria para listagem publica/admin client)
- `MASTER_EMAIL` (opcional, restringe acesso de mestre por email)
- `CHARACTER_CREATION_ALLOWED_EMAILS` (opcional, lista de emails autorizados a criar personagem, separados por virgula)

Tabela necessaria para cadastro via menu do mestre:

- `character_creation_whitelist` (coluna `email` como chave primaria)

## Diagnostico rapido

### Erro de autenticacao (401)

- Confirmar se o token esta no header Authorization.
- Confirmar se a sessao Supabase ainda esta valida.
- Se for rota admin, confirmar `MASTER_EMAIL`.

### Erro em listagem publica de personagens

- Verificar `SUPABASE_SERVICE_ROLE_KEY`.
- Verificar acesso a tabela `characters`.

### Build quebrando no client

- Rodar `yarn type-check:client`.
- Verificar aliases `@` e configs de `tsconfig`/`vite.config.ts`.

### Build quebrando no server

- Rodar `yarn type-check:server`.
- Validar import/export com extensao `.js` nos imports do TS compilado para NodeNext.

## Divida tecnica conhecida

- Existem links no menu do Dashboard para rotas ainda nao registradas (`/skills`, `/titulos`, `/classes`, `/npcs`, `/notas`).
  - Impacto: navegacao para rotas inexistentes.
  - Acao sugerida: criar as rotas/views ou remover links ate implementacao.
