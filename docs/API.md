# API Backend

Base URL local (dev):

- `http://localhost:3000/api`

Healthcheck:

- `GET /health`

## Autenticacao

Endpoints protegidos esperam:

- Header `Authorization: Bearer <supabase_access_token>`

Regra de mestre:

- Endpoints `/admin` exigem usuario autenticado.
- Se `MASTER_EMAIL` estiver configurado, o email do token deve bater com esse valor.

## Personagens

Prefixo: `/api/personagens`

- `GET /pagina`
  - publica
  - retorna layout da tela inicial + personagens publicos

- `GET /`
  - autenticado
  - lista personagens do usuario logado
  - filtros por query: `nome`, `minLevel`, `maxLevel`, `campaignId`

- `GET /:characterId`
  - autenticado
  - retorna personagem do proprio usuario

- `GET /admin/:characterId`
  - mestre
  - retorna personagem por id sem restricao de dono

- `POST /`
  - autenticado
  - cria personagem
  - body (resumo): `{ name, level?, avatarUrl?, data?, campaignId? }`

- `PATCH /:characterId`
  - autenticado
  - edita personagem do proprio usuario

- `DELETE /:characterId`
  - autenticado
  - soft delete (`deleted_at`)

- `PATCH /:characterId/solicitacao`
  - autenticado
  - cria solicitacao de alteracao pendente
  - body (resumo):
    - `name?`
    - `avatarUrl?`
    - `history?`
    - `historyDocumentPath?`
    - `historyDocumentName?`
    - `historyDocumentMimeType?`

## Aprovacoes (mestre)

Prefixo: `/api/personagens/admin`

- `GET /solicitacoes`
  - lista solicitacoes pendentes

- `POST /solicitacoes/:characterId/revisar`
  - aprova/rejeita solicitacao
  - body: `{ approve: boolean }`

- `POST /personagens/:characterId/notas`
  - adiciona nota de aventura no personagem
  - body: `{ note: string }`

## Catalogos (mestre)

### Deuses

Prefixo: `/api/gods`

- `GET /admin`
  - lista deuses para painel mestre

- `POST /admin`
  - cria deus
  - body:
    - `name: string`
    - `description?: string`
    - `title?: string`
    - `indole?: string`
    - `dogma?: string`
    - `anatema?: string`
    - `weapons?: string`
    - `shortDescription?: string`
    - `imageUrl?: string`

- `PATCH /admin/:godId`
  - edita deus
  - body: mesmos campos opcionais do `POST` (incluindo `name?`)

### Cidades/Mapas

Prefixo: `/api/city-maps`

- `GET /admin`
  - lista mapas para painel mestre

- `POST /admin`
  - cria mapa
  - body:
    - `name: string`
    - `mapReference: string`
    - `description?: string`
    - `imageUrl?: string`
    - `pointsOfInterest?: PointOfInterest[]`

- `PATCH /admin/:cityMapId`
  - edita mapa
  - body: mesmos campos opcionais do `POST` (incluindo `name?` e `mapReference?`)

`PointOfInterest`:

- `id?: string`
- `name: string`
- `x: number`
- `y: number`
- `description?: string`

### Classes

Prefixo: `/api/classes`

- `POST /admin`
  - body: `{ name: string, tier: string, description: string, maxLevel?: number }`

### Skills

Prefixo: `/api/skills`

- `POST /admin/personagens/:characterId`
  - body: `{ skillName: string }`

### Titulos

Prefixo: `/api/titulos`

- `POST /admin`
  - body: `{ name: string, tier: string, description: string }`

- `POST /admin/personagens/:characterId`
  - body: `{ titleName: string }`

## Codigos de resposta (resumo)

- `200` sucesso
- `201` criado
- `400` validacao/regra de negocio
- `401` autenticacao/permissao
- `404` recurso nao encontrado
- `500` erro interno
