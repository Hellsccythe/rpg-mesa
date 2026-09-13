# Mundos — o site como world manager

O site mestra **mais de uma sessão**: cada campanha (`campaigns`) é um mundo, com deuses, mapas, NPCs, raças, passados e livros próprios, e com o conjunto de classes e títulos que o mestre escolheu. Este documento é o desenho decidido em 13/09/2026 e a ordem de entrega. O que já está feito vem marcado.

## Decisões

| Pergunta | Decisão |
|---|---|
| Tabelas por campanha? | **Não.** Uma coluna `campaign_id` nas tabelas de conteúdo de mundo; todas as campanhas convivem nas mesmas tabelas. "Só o esquema, vazio" = não inserir linha nenhuma para a campanha nova |
| "Classes diferentes por mundo" | **Conjunto diferente**, não conteúdo: classes, skills e títulos continuam um catálogo só (são regra — dano, XP, progressão); cada mundo escolhe **quais estão disponíveis** (`campanha_catalogo`) |
| O mesmo jogador em mais de um mundo | **Sim.** O limite de personagens de uma conta é decisão do mestre no pré-registro do e-mail (`usuarios.limite_personagens_por_mundo`, padrão 1) |
| Número do mundo | `campaigns.numero` (migration 100), separado do id: é lore, editável, único entre as campanhas vivas. Aparece como **"Mundo 2 — Elyra"** no seletor, na tela de campanhas e na tela pública de mundos. A campanha atual é o Mundo 2 a pedido do mestre — outro mundo vai ser o 1 |
| `campaign_gms` restringe o mestre? | **Não.** Todo mestre vê todos os mundos; a lista de GMs é informativa |
| Panteão | Vira livro **gerado dos deuses do mundo**; o texto fixo dos 21 deuses sai do cliente. Mundo sem deuses, prateleira sem Panteão. `/deuses` continua pública, em `/mundo/:slug/deuses` |
| Imagens ao copiar um mundo | **Compartilham o caminho** em `uploads/`. Regra: delete de catálogo nunca apaga arquivo do disco (já é assim — só o avatar de personagem é removido fisicamente) |

## O que é mundo e o que é sistema

| Grupo | Tabelas | Tratamento |
|---|---|---|
| **Mundo** (`campaign_id NOT NULL`) | `gods`, `city_maps`, `npcs`, `racas`, `passados`, `lore_notes` | escopo por campanha; copiáveis ao criar um mundo |
| **Sistema** (global) | `classes`, `skills`, `titles`, `pericias`, `level_progression`, `class_level_progression`, `classe_marco_virtude`, toda a economia (`equipamentos`, `itens`, `consumiveis`, `receitas`, `condicoes`, `raridade`), lookups, `regras_do_sistema` | iguais em todo mundo; classes e títulos têm **disponibilidade** por mundo |
| **Por personagem** | `player_telas`, `npc_acesso_player`, `lore_note_acesso`, `skill_character_override`, `classe_secreta_revelada`, `fabricacoes` | já escopados pelo personagem; as listas do mestre passam a filtrar pelo mundo ativo |

**Por que classes/skills/títulos não vão para "mundo":** referenciam-se por **nome** (`classes.starting_skills` → `skills.name`; `skills.required_class` guarda o id da classe como texto; `data.skills[].name`; `skill_character_override.skill_name`), sustentados por três UNIQUE totais em `name`. Com homônimos em dois mundos, o onboarding valida com `LIMIT 1` sem campanha e a cascata de delete (`array_remove` em `classes.starting_skills`) escreve nas classes de todos os mundos. Duplicar exigiria reescrever toda referência por nome, copiar 580 + 116 linhas de progressão por mundo e balancear N vezes.

`classe_secreta_revelada.UNIQUE(classe_id)` vira `(campaign_id, classe_id)`: a exclusividade de classe secreta é por mundo.

## Campanha ativa — como o servidor sabe o mundo

Precedência, do mais forte para o mais fraco:

1. **Rota com personagem manda** (`characterId` na query, no param ou no corpo): a campanha é `characters.campaign_id` — para todo mundo, mestre incluído. Vale também nas **escritas**: `garantirRegistroAtivo`, `buscarClasseOuFalhar`, revelar classe secreta, conceder acesso a NPC/livro conferem `campaign_id` do catálogo contra o do personagem.
2. **Header `X-Campanha`** enviado pelo interceptor axios sempre que o cliente conhece o mundo: mestre → o selecionado (`rpg-mesa.mundo-ativo`); jogador → o do personagem ativo; anônimo em `/mundo/:slug/...` → o slug. O servidor só aceita campanha existente, e **ativa** para anônimo. `enableCors` ganha `maxAge` para o preflight não repetir a cada GET.
3. **Sem nenhum dos dois:** uma campanha ativa só → ela; mais de uma → `400`. Nunca "todos os mundos".

No código (feito na fase 1): `ContextoRequisicao.campanhaId` (`server/src/common/cls/contexto-requisicao.ts`), preenchido pelo `CampanhaAtivaInterceptor` (`modules/campanhas/`, registrado como `APP_INTERCEPTOR` — roda depois dos guards, então sabe se é mestre: mestre pode apontar para mundo inativo, o resto só para ativo; header inválido é ignorado, nunca erro). `CampanhasService.resolverCampanhaAtiva(id?)` aplica a ordem id explícito → contexto → única ativa → 400. Fase 2 acrescenta o helper `filtroDeCampanha()` para o SQL cru e um teste que varre as constantes SQL das tabelas de mundo exigindo `campaign_id`.

No cliente (feito na fase 1): `lib/mundo-ativo.ts` guarda o mundo em `localStorage['rpg-mesa.mundo-ativo']` e o interceptor do axios (`plugins/axios.ts`) manda `X-Campanha: <slug>`; `stores/mundo.ts` é quem escreve; `SeletorDeMundo.vue` está montado **uma vez em `app.vue`** para rotas `/master` (padrão do `TrocaDeSenhaObrigatoria`) — pílula fixa no canto "🌍 Mundo 2 — Elyra ▾"; o modal de escolha só aparece sem mundo guardado e com duas ou mais campanhas ativas (e aí não fecha sem escolha); com uma só, entra direto; trocar de mundo recarrega a página. Quem loga por `/mundo/:slug` (mestre ou jogador) já entra naquele mundo; **sair** (e só sair — `limparMetaAuthLocal` roda para o visitante anônimo, que precisa do mundo) limpa o mundo guardado. Feito na fase 2: as telas do jogador passam `characterId` aos catálogos (`gods`, `racas`, `passados`, `city-maps`), e o header do jogador mostra o nome do mundo do personagem; `/mundo/:slug/deuses` resolve o slug para o mundo ativo antes de buscar.

## Criar um mundo — os checkboxes

| Checkbox | Marcado | Desmarcado |
|---|---|---|
| Deuses, Mapas, Raças, NPCs (puxa Raças), Passados, Livros | **copia** as linhas do mundo de origem | o mundo nasce com **zero**; o mestre cadastra |
| Classes, Títulos | **disponibiliza** todas as do sistema no mundo novo | nenhuma disponível; o mestre liga uma a uma na tela de classes/títulos |

Cópia pelo ORM, linha a linha, numa transação (os hooks preenchem `created_by`; o `create` devolve o id novo para o mapa velho → novo). Remapeamentos: `npcs.raca_id`; `city_maps.data.parentCityMapId` e `pointsOfInterest[].targetCityMapId` (dentro do JSONB). Passados apontam para skills/títulos/perícias globais — copiam como estão. Livros: só os de visibilidade `todos`, sem os acessos. Endpoint próprio `POST /campanhas/admin/:id/copiar-de`, com timeout maior que os 10 s do axios. O formulário avisa ao desmarcar **Raças** ou **Passados**: mundo sem eles prende o jogador aprovado no onboarding.

## Livros (lore_notes)

- `campaign_id NOT NULL`; `visibilidade` em `todos | escolhidos | ninguem` (rascunho); `lore_note_acesso(lore_note_id, character_id)` UNIQUE total, sem soft delete — o padrão de `npc_acesso_player`. `character_id` saiu (migration 099).
- `formato`: `livro | pergaminho | bilhete | carta`. Os três últimos são folha única; mudam só a cara da folha.
- Jogador: `GET /lore-notes?characterId=` obrigatório → `campaign_id` do personagem e (`todos` ou `escolhidos` com linha de acesso). Mestre: `GET /lore-notes/admin?campaignId=` (sem, a única campanha ativa).
- Tela `/master/livros`: DataTable + modal com abas Conteúdo | Formato e capas | Acesso. O acesso grava o conjunto (`PATCH` com `characterIds`, em transação).
- Os arquivos (`pdf_url`, capas) são estáticos públicos em `/uploads/`: o acesso protege a prateleira, não o arquivo.

## Ordem de entrega

| Fase | O quê | Estado |
|---|---|---|
| 0 | Administração de livros: migration 099, acesso a vários personagens, `/master/livros`, formatos bilhete/carta | **feita** (commit 8a6b1f7) |
| 1 | Campanha ativa: contexto, header `X-Campanha`, `SeletorDeMundo`, precedência; `campaigns.numero` (100); painel lista os personagens do mundo ativo | **feita** |
| 2 | Escopo de deuses/mapas/NPCs/raças/passados com validação nas escritas (`garantirRegistroAtivo` confere o mundo do personagem); Panteão gerado dos deuses (`lib/livro/panteao.ts`); os 21 deuses e o Hamlet fixos saem do cliente; nome do mundo no header do jogador; listas do mestre por mundo (`GET /personagens` do mestre, telas, acessos de NPC, classes secretas por `(campaign_id, classe_id)`); `characters.username` único por `(campaign_id, username)`; "já tenho conta" na criação de personagem (`conta_existente`, `usuario_id` na solicitação — migration 102); `limite_personagens_por_mundo` no pré-registro; campanha renomeada para Elyra; header `X-Campanha` desconhecido passa a ser 400 (ignorá-lo mandava a escrita para a única ativa) | **feita** (migrations 101–102) |
| 2b | Criar mundo com checkboxes (cópia + disponibilidade) e aviso de mundo vazio | — |
| 3 | Só se um dia for preciso **editar** classes por mundo: a cópia grande (referências por nome, UNIQUE por campanha, progressões) — projeto à parte | — |

Antes das migrations da fase 2, regerar `docs/SCHEMA_CURRENT.sql` (o dump está sem as colunas da 098).

## Números em 13/09/2026

1 campanha (`caminho-sem-volta`, id 1); 0 personagens sem campanha; 21 deuses, 1 mapa, 3 raças, 7 passados, 0 NPCs, 5 livros; 29 classes, 59 skills, 20 títulos; 2 contas gm, 0 linhas em `campaign_gms`.
