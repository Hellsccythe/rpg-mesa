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
| `/deuses` | DeusesView | pública — nome e título do deus ficam **abaixo da arte**, sempre visíveis; o overlay do hover é só enfeite, e no celular não há hover |
| `/cidade` | CidadeView | auth |
| `/classes` | ClassesView | auth — o card de cada classe mostra o **XP da classe** (`data.classes[].xp`) contra `class_level_progression`; a tabela de níveis do personagem, embaixo, é `level_progression` |
| `/skills` | SkillsView | auth |
| `/titulos` | TitulosView | auth |
| `/racas` | RacasView | auth |
| `/equipamentos` | EquipamentosView | auth |
| `/npcs` | NpcsView | auth |
| `/notas` | NotasView | auth — prateleira; ao abrir uma nota, `LivroLeitor` (`components/book/`) mostra o livro fechado, abre a capa e vira as folhas pela quina. A primeira página fica à direita da guarda, como num livro impresso; o índice do Panteão salta por **número de página** (`GOD_PAGE_MAP` é derivado das páginas) |
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
| `/master/pericias` | MasterPericiasView | auth + isMaster |
| `/master/receitas` | MasterReceitasView | auth + isMaster |
| `/master/itens` | MasterItensView | auth + isMaster |
| `/master/consumiveis` | MasterConsumiveisView | auth + isMaster |
| `/master/condicoes` | MasterCondicoesView | auth + isMaster |
| `/master/passados` | MasterPassadosView | auth + isMaster |
| `/master/livros` | MasterLivrosView | auth + isMaster — a administração de livros: `DataTable` + modal em três abas (Conteúdo, Formato e capas, Acesso). O acesso é **Todos do mundo / Só estes personagens / Ninguém (rascunho)**; a lista de personagens é a do mundo da nota |
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
| GET | `/api/tabelas-acessorias/uso-equipamento` | público (Arma \| Armadura \| Variados) |
| POST/PATCH/DELETE | `/api/tabelas-acessorias/uso-equipamento/admin[/:item]` | isMaster |
| GET | `/api/tabelas-acessorias/categorias-arma` | público |
| GET | `/api/tabelas-acessorias/propriedades-arma` | público |
| GET | `/api/tabelas-acessorias/classes-arma` | público |
| GET | `/api/tabelas-acessorias/categorias-armadura` | público |
| GET | `/api/tabelas-acessorias/propriedades-armadura` | público |
| GET | `/api/tabelas-acessorias/classes-armadura` | público |
| GET | `/api/tabelas-acessorias/categorias-variados` | público |
| GET | `/api/tabelas-acessorias/propriedades-variados` | público |
| GET | `/api/tabelas-acessorias/classes-variados` | público |
| GET | `/api/pericias` | público |
| POST/PATCH/DELETE | `/api/pericias/admin[/:id]` | isMaster |
| POST | `/api/personagens/admin/:id/pontos-pericia` | isMaster (downtime) |
| POST | `/api/personagens/:id/subir-pericia` | auth — dono ou mestre |
| GET | `/api/receitas` | público |
| POST/PATCH/DELETE | `/api/receitas/admin[/:id]` | isMaster |
| GET | `/api/itens` | público |
| POST/PATCH/DELETE | `/api/itens/admin[/:id]` | isMaster |
| GET | `/api/itens/categorias` | público |
| POST/PATCH/DELETE | `/api/itens/categorias/admin[/:item]` | isMaster |
| GET | `/api/consumiveis` | público |
| POST/PATCH/DELETE | `/api/consumiveis/admin[/:id]` | isMaster |
| GET | `/api/consumiveis/categorias` | público |
| POST/PATCH/DELETE | `/api/consumiveis/categorias/admin[/:item]` | isMaster |
| GET | `/api/condicoes` | público |
| GET | `/api/personagens/:id/inventario` | auth — dono ou mestre (com nome, peso e valor do catálogo) |
| POST | `/api/personagens/:id/inventario` | auth — dono ou mestre (empilha se o catálogo permite) |
| DELETE | `/api/personagens/:id/inventario/:posicao` | auth — dono ou mestre (tira `quantidade` da pilha) |
| PATCH | `/api/personagens/:id/inventario/:posicao` | auth — dono ou mestre (`rapido` ou `equipado`) |
| GET | `/api/personagens/:id/fabricar/checar?receita_id=` | auth — dono ou mestre (pode? por que não? chances) |
| POST | `/api/personagens/:id/fabricar` | auth — dono ou mestre (**rola no servidor**, consome e entrega numa transação) |
| GET | `/api/personagens/:id/fabricar/historico` | auth — dono ou mestre |
| POST/PATCH/DELETE | `/api/condicoes/admin[/:id]` | isMaster |
| GET | `/api/raridades` | público |
| POST/PATCH/DELETE | `/api/raridades/admin[/:item]` | isMaster |
| GET | `/api/indole` | público |
| GET | `/api/genero` | público |
| POST | `/api/character-creation-requests` | público |
| POST | `/api/character-creation-requests/upload-avatar` | público |
| POST | `/api/character-creation-requests/upload-historia` | público |
| GET | `/api/character-creation-requests/admin` | isMaster |
| GET | `/api/character-creation-requests/admin/pendentes/count` | auth |
| PATCH | `/api/character-creation-requests/admin/:id/aprovar` | isMaster (body `{campaign_id?}` — a escolha do mestre vale mais que a da solicitação; sem nenhuma das duas, 400) |
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
| GET | `/api/classes/progressao?classe_id=X` | auth (XP por nível dentro de uma classe — era isMaster, mas o card da classe do jogador precisa dela) |
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
| PATCH | `/api/personagens/:id` | auth — dono ou mestre. **Para o dono só funde `data.changeRequestResponse`** e ignora o resto (nome, nível, `data` inteiro): a rota aceitava tudo, e qualquer jogador regravava `classPoints`, `level` ou as notas com o próprio token |
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
| PATCH | `/api/personagens/admin/personagens/:id/notas/:indice` | isMaster (`{note?, oculta?}` — as notas não têm id, a posição é o endereço) |
| DELETE | `/api/personagens/admin/personagens/:id/notas/:indice` | isMaster |
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
| GET | `/api/lore-notes?characterId=X` | auth — só o dono do personagem ou o mestre. **`characterId` é obrigatório para o jogador** (é dele que sai o mundo); o mestre sem ele vê tudo do mundo ativo |
| GET | `/api/lore-notes/admin?campaignId=` | isMaster (sem `campaignId`, a única campanha ativa; com mais de uma, 400) |
| GET | `/api/lore-notes/admin/personagens-do-mundo?campaignId=` | isMaster (personagens do mundo, todos desmarcados — para a lista de acesso de uma nota nova) |
| GET | `/api/lore-notes/admin/:id/acessos` | isMaster (personagens do mundo da nota, marcando quem tem acesso) |
| POST | `/api/lore-notes/admin` | isMaster (`formato` livro \| pergaminho \| bilhete \| carta, `visibilidade` todos \| escolhidos \| ninguem, `characterIds[]`, `capaUrl`, `contracapaUrl`) |
| POST | `/api/lore-notes/admin/upload-capa` | isMaster (multipart `file`, imagem → PNG até 1600px em `uploads/lore/`) |
| PATCH | `/api/lore-notes/admin/:id` | isMaster (`characterIds` ausente = não mexe na lista; array = substitui o conjunto, numa transação) |
| DELETE | `/api/lore-notes/admin/:id` | isMaster (soft delete, 204) |
| GET | `/api/player-telas/disponiveis` | público (lista fixa das telas liberáveis) |
| GET | `/api/player-telas/me?characterId=X` | auth — só o dono do personagem ou o mestre |
| GET | `/api/player-telas/admin/:characterId` | isMaster |
| PUT | `/api/player-telas/admin/:characterId` | isMaster (substitui o conjunto inteiro) |
| GET | `/api/admin/exportar-schema?dialeto=postgresql\|mysql\|sqlite` | isMaster (devolve texto puro como anexo) |

## Mundos — o site como world manager

O site vai mestrar **mais de uma sessão**: cada campanha é um mundo com deuses, mapas, NPCs, raças, passados e livros próprios, e com o conjunto de classes e títulos que o mestre marcou ao criar o mundo. O desenho, as decisões e a ordem de entrega estão em **`docs/MUNDOS.md`** — leia antes de mexer em campanhas, em qualquer catálogo ou em `lore_notes`. Em resumo: **não** há tabelas por campanha (é uma coluna `campaign_id` nas tabelas de conteúdo de mundo); classes/skills/títulos ficam **globais**, com disponibilidade por mundo, porque se referenciam por nome; a campanha de uma requisição vem do **personagem** quando há um, do header `X-Campanha` quando não há, e da única campanha ativa como último recurso (nunca "todos os mundos"). Fase 0 (livros) está feita; as demais, não.

## Direção do produto — o site e o aplicativo futuro

**O site é um "character manager" para o jogador e um "world manager" para o mestre.** As sessões serão jogadas num **aplicativo futuro, estilo Foundry, específico deste RPG e feito para rodar em celular fraco**. O site precisa continuar capaz de sustentar uma sessão sozinho — é o plano B se o app falhar —, então perícias, inventário, combate e regras ficam utilizáveis nele.

O que isso decide, desde já:

- **Regra e conta vivem no servidor e voltam na resposta.** Rolagem, resultado de fabricação, bônus de teste: o servidor decide, os dois clientes só mostram. O que for calculado só num componente Vue é invisível para o app. `regras_do_sistema` é a tabela das constantes de regra.
- **Onde há cópia cliente/servidor de uma regra** (`bonusDoTeste`, `desceUmPasso`), a do servidor é a que vale; a do cliente é só para prévia.
- **API magra e agnóstica de cliente.** REST simples, JWT (já serve aos dois), respostas sem excesso — o app roda em celular fraco.
- **Mobile-first em toda tela nova.** As telas antigas, desktop-first, não se reescrevem por isso; mudam quando forem tocadas.
- **`characters.data.inventario`** (tabela, id, quantidade, qualidade, rapido, equipado) é o modelo de inventário que os dois clientes leem.

## Economia — a base do projeto

**`docs/ECONOMIA.pdf` é a referência.** A migration 079 adotou os números dele, e preço novo deve ser ancorado nas mesmas âncoras.

- **Moeda:** bronze → prata → ouro, na razão **1:10:1000** — **um ouro vale cem prata** (migration 092; era dez). Preço se pensa em **prata**. O ouro é moeda de nobre e de realeza: uma peça é quase dois meses de salário de artesão, e vê-la numa taverna é acontecimento. Nenhum código converte entre moedas (o dinheiro é guardado por moeda, `{prata: 73, ouro: 2}`), então a razão vive só em `regras_do_sistema` e nos documentos.
- **Só a Nobreza rola ouro no dinheiro inicial** (migration 093): 1d10 ouro + 4d10 prata. Os outros rolam prata — Mercenário e Guarda 4d100, Aventureiro 3d100, Varejista 5d100, Andarilho 6d10, Vítima 4d10. Médias: Nobreza 572, Varejista 253, Guarda e Mercenário 202, Aventureiro 152, Andarilho 33, Vítima 22. **A amplitude é 26:1** (a 079 tinha calibrado 2,6:1), e os preços do catálogo foram ancorados na escala antiga — um Guarda compra um Arcabuz (180 pr) no primeiro dia. Decisão do mestre; se recalibrar, é editar cinco linhas na 093.
- **Âncora:** 2 prata = um dia de trabalho sem qualificação; 5 prata = um dia de artesão; **60 prata = um mês**.
- **Dinheiro inicial:** média de 22 (Vítima) a 57 (Nobreza) prata. Amplitude 2,6:1 — era 10:1 antes da 079.
- **Crafting:** os ingredientes devem somar **70–75%** do preço de compra. A API de receitas calcula a proporção a cada leitura e a tela colore por faixa.
- **`valor` é o preço final.** O `multiplicador_valor` da raridade é referência para o mestre decidir esse número, e **não é aplicado** em cima — aplicar criaria dupla contagem.

**Peso das armaduras (migration 079) é mudança de regra, não de preço.** A capacidade de carga é `2 + força × 2` kg; as armaduras pesavam de 10 a 30 kg, e um personagem de distribuição equilibrada (força 2) carrega 6 kg. **Nenhum personagem novo conseguia vestir armadura**, e a Armadura Completa era impossível até com os 10 pontos em força. Os pesos foram corrigidos para os reais (couro 8 kg, malha 12, placas 25); a fórmula não mudou.

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
| `TrocaDeSenhaObrigatoria` | `components/TrocaDeSenhaObrigatoria.vue` | Montado **uma vez em `App.vue`**; abre em qualquer rota autenticada enquanto `authStore.precisaTrocarSenha` for verdadeiro, e só fecha trocando a senha |
| `LivroLeitor` | `components/book/LivroLeitor.vue` | O leitor de livro: capa fechada que abre, spread no desktop e página única no celular, a folha virando **pela quina** com o dedo/mouse (arraste), toque, setas ← → e botões. As capas também acompanham o arraste (`gestoDeCapaPara`): na primeira folha, puxar a guarda fecha; na última, puxar a guarda de trás vira a contracapa; ← e → fazem o mesmo. Props `paginas`, `titulo`, `subtitulo`, `noteTitulo`, `imagemDaCapa`; emite `fechar` |
| `FolhaComDobra` | `components/book/FolhaComDobra.vue` | Uma folha com a quina dobrada, desenhada a partir de um ponto (onde a quina está): frente recortada, aba refletida com o verso, sombras. Não anima — o leitor move o ponto. A matemática está em `lib/livro/dobra.ts` (mediatriz C–P, reflexão como `matrix()`, Sutherland–Hodgman para os recortes) |
| `CapaDoLivro` | `components/book/CapaDoLivro.vue` | A capa: arte SVG própria (moldura dourada, coluna de dados) ou `imagem`, com o título em Cinzel por cima; `semTitulo` para a contracapa |
| `PergaminhoLeitor` | `components/book/PergaminhoLeitor.vue` | Uma folha só: `formato` escolhe a cara — **pergaminho** (rolo antigo, bordas rasgadas), **bilhete** (papel pequeno e amassado, torto) ou **carta** (folha limpa com cabeçalho, dobras e lacre). Os `---` viram ornamentos, não páginas |

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

Schema completo em `docs/SCHEMA_CURRENT.sql` — **arquivo gerado por `pg_dump --schema-only`, não editado a mão**; regere-o quando mexer no esquema (o comando está no cabeçalho do próprio arquivo). Migrations em `database/migrations/` (001–099). Documentação em PDF, com as ligações entre tabelas e os fluxos: `docs/BANCO_DE_DADOS.pdf`.

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
| `inventario` | **o inventário estruturado** (migration de código, sem SQL): `[{tabela, id, quantidade, qualidade, rapido, equipado}]`. Substituiu `inventory`, `quickInventory` e `equipamentos_iniciais`, que eram texto livre ou parciais e estavam vazios em todo personagem. Nome, peso e valor **nunca** são gravados aqui — vêm do catálogo na resposta |
| `adventureNotes` | notas de aventura escritas pelo mestre: `[{text, addedBy, addedAt, oculta?, editadaEm?, editadaPor?}]`. **`oculta` some da resposta do jogador** (`mapearPersonagemParaJogador`) e continua com o mestre; o livro do jogador (`/notas`) mostra as visíveis como "Diário de Aventura", uma por página |
| `pendingChangeRequest` | pedido de alteração aguardando revisão (índice parcial em cima) |
| `avatarFocalPoint` / `modalHeroPosition` | enquadramento da imagem, ajustado pelo mestre |
| `xp` | XP do personagem (distinto do XP por classe) |
| `dinheiro_inicial` | resultado da rolagem da etapa 6: `{tentativas, resultado, descartado}` |
| `deusEtapaConcluida` | marca a etapa 5 como vista, mesmo se pulada |

**Cuidado:** `PATCH /api/personagens/:id` **substitui o `data` inteiro** quando quem chama é o mestre. Mandar um objeto parcial apaga o resto sem aviso. É por isso que o inventário tem rotas próprias e **não passa por esse PATCH**: uma cópia velha de `data` no cliente apagaria o que a ação de fabricar acabou de gravar. Para o **dono** a rota só funde `changeRequestResponse` — o único campo que o dashboard do jogador grava por ela.

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
| `uso_equipamento` | — | Para que serve: Arma, Armadura, Variados. Era `equipamento_tipo` até a migration 072 |
| `categoria_arma` | `uso_equipamento_item` | Categorias de arma |
| `categoria_armadura` | `uso_equipamento_item` | Categorias de armadura |
| `categoria_variados` | `uso_equipamento_item` | Categorias de variados |
| `propriedade_arma` | `categoria_arma_item` opcional | Propriedades de arma |
| `classe_arma` | `categoria_arma_item` opcional | Classes de arma |
| `propriedade_armadura` | `categoria_armadura_item` opcional | Propriedades de armadura |
| `classe_armadura` | `categoria_armadura_item` opcional | Classes de armadura |
| `propriedade_variados` | `categoria_variados_item` opcional | Propriedades de variados |
| `classe_variados` | `categoria_variados_item` opcional | Classes de variados |

Gerenciadas em `/master/tabelas-acessorias`. Backend em `server/src/modules/tabelas-acessorias/`.

### `raridade` (migration 073)

Escala única de raridade para **todas** as tabelas de item — equipamentos, e mais tarde consumíveis e itens. Uma poção Rara e uma espada Rara são igualmente difíceis de achar; escala comum permite comparar entre categorias.

| Coluna | Tipo | Notas |
|---|---|---|
| item | INTEGER PK | **IDENTITY de verdade** — o banco gera. As outras lookups escolhem a chave com `MAX(item)+1`, que foi o que causou a migration 067 |
| descricao | VARCHAR(100) | Comum, Incomum, Raro, Épico, Lendário. UNIQUE **parcial** entre as ativas |
| ordem | INTEGER | posição na escala. **É por ela que se ordena, não pelo `item`** — uma raridade nova entre Raro e Épico receberia o item 6 e iria para o fim da lista |
| multiplicador_valor | NUMERIC(6,2) | quanto o preço-base é multiplicado |
| dificuldade_base | INTEGER | dificuldade do teste para fabricar. **Nulo em Lendário**: o mestre decide caso a caso |
| disponibilidade | TEXT | onde o item é encontrado à venda |
| cor | VARCHAR(20) | nome de cor do Tailwind, para o frontend não manter um mapa paralelo |

Seed: Comum (×1, dif. 10), Incomum (×3, dif. 15), Raro (×10, dif. 20), Épico (×40, dif. 25), Lendário (o mestre decide).

**A `dificuldade_base` é a DC do teste de perícia** — ver a seção de `pericias`.

Raridade aqui **decide coisas** em vez de ser etiqueta: uma referência responde "o mercador tem isso?", "quanto custa?" e "quão difícil é fabricar?".

`equipamentos.raridade_item` aponta para cá; os 14 registros existentes nasceram Comum. Deletar uma raridade em uso é **recusado pelo serviço** — sem FOREIGN KEY, nada impediria no banco, e o item ficaria apontando para o vazio sem erro nenhum.

### `consumiveis` e `categoria_consumivel` (migration 075)

Primeira das duas tabelas que tiram de `equipamentos` o que nunca foi equipamento. **O corte é por comportamento, não por tema** — a pergunta que decide a tabela é *"o que acontece quando o jogador usa isso?"*:

| Tabela | Regra | O que entra |
|---|---|---|
| `equipamentos` | equipa e **fica** equipado | armas, armaduras, escudos |
| `consumiveis` | usa e **some** | poções, venenos, munição, alimento, pergaminhos |
| `itens` | só carrega, vende ou **entrega numa receita** | cosméticos, ferramentas, materiais, ingredientes |

"Some quando usa?" tem **uma** resposta. "É cosmético ou utilitário?" é opinião, e critério que exige julgamento produz dado inconsistente.

Uma poção fica em `consumiveis`; a erva que a produz fica em `itens`. As duas se ligam pela tabela de receitas — receita é **muitos-para-muitos e cruza tabelas**, então não cabe como coluna de nenhuma das duas.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| nome | VARCHAR(255) | NOT NULL |
| descricao | TEXT | nullable |
| efeito | TEXT | **NOT NULL** default `''` — o que acontece ao usar. Grava string vazia, nunca null |
| usos | INTEGER | NOT NULL default 1 — poção tem 1, kit de primeiros socorros vários |
| duracao | VARCHAR(60) | "Instantâneo", "3 turnos". Texto livre: a mesa fala em turnos e em horas |
| peso | NUMERIC(8,2) | nullable |
| valor | NUMERIC(12,2) | **preço final** em prata — ver abaixo |
| raridade_item | INTEGER | referência a `raridade.item` |
| categoria_consumivel_item | INTEGER | referência a `categoria_consumivel.item` |
| via | VARCHAR(20) | **só veneno** (migration 090) — CHECK `lamina` \| `ingestao` \| `contato`. NULL em poção e prato; é assim que a tela sabe quando mostrar o campo |
| cura_dado | VARCHAR(20) | a cura em número (migration 091), ex: `1d6`. Em prato, é a cura de **bem feito** |
| cura_percentual | INTEGER | percentual do PV máximo somado ao dado. CHECK 0–100 |
| efeito_bemfeito | TEXT | o que **mais** acontece quando o prato sai bem — hoje, o bônus social |

**`cura_dado` + `cura_percentual` valem para poção E para prato.** "Recupera 1d4 + 20% do PV máximo" vivia dentro de `efeito` em texto e não era calculável — o mesmo defeito da coluna `dano` corrigido na migration 087. As três poções de cura foram convertidas na 091.

**`valor` é o preço final, não uma base.** O `multiplicador_valor` da raridade é **referência para o mestre decidir** esse número e **não é aplicado** em cima dele. Aplicar automaticamente criaria dupla contagem: quem já pensou o preço de um item Raro veria ele multiplicado por 10 ao salvar. A tela mostra o multiplicador ao lado do campo, como apoio.

`categoria_consumivel`: lookup com `item` IDENTITY. Seed: Poção, Veneno, Munição, Alimento, Pergaminho. Apagar categoria em uso é recusado pelo serviço.

#### Os três catálogos (migrations 083, 090 e 091)

| Categoria | Quantos | Documento | Perícia da receita | O que o diferencia |
|---|---|---|---|---|
| Poção | 28 | `docs/POCOES.pdf` | Alquimia | cura ou previne uma condição |
| **Veneno** | 16 | `docs/VENENOS.pdf` | Alquimia | **inflige** uma condição; tem `via`; Fortitude DC do tier para resistir |
| **Alimento** | 12 | `docs/ALIMENTOS.pdf` | **Cozinha** | cura sem aplicar Saturação Alquímica; nunca em combate |

Todos são gerados de `docs/*_dados.py` → `verificar_*.py` → PDF e migration, pelo mesmo arquivo. **Para mudar um preço ou receita, edite os dados e regere** — não edite o SQL nem o HTML.

**Veneno é a poção com o sinal trocado.** O antídoto que já existe contra uma condição vale contra qualquer veneno que a aplique, sem ninguém escrever essa ligação. Calibrado para que **envenenar nunca saia mais barato que se defender**: o verificador recusa um veneno mais barato que o antídoto que o anula. Só 5 dos 16 (os de lâmina) funcionam em combate — de propósito. Os 4 farsantes não têm antídoto: passam sozinhos, e a defesa é Medicina.

**Alimento é a resposta à Saturação Alquímica.** Duas poções travam a terceira por uma semana; comida cura sem saturar. O preparo é teste de **Cozinha contra a DC do tier**: mal feito cura **1d4 fixo** (regra `alimento.cura_malfeito`, não coluna — é igual para o catálogo inteiro, e é o que torna caro estragar ingrediente raro); bem feito cura `cura_dado + cura_percentual`, que escala com o tier. O tier do prato é o do **ingrediente mais raro** da receita. A refeição leva 10–30 min (`duracao`), mais que qualquer luta. Quatro pratos dão bônus social (`efeito_bemfeito`), só bem feitos, e para quem **partilhou** a mesa.

Tela: `/master/consumiveis` → `MasterConsumiveisView.vue`. O formulário mostra um bloco por categoria — via para veneno, cura para poção e prato, "se bem feito" para prato.

### `condicoes` e `consumivel_condicao` (migrations 080 e 083)

O que dá errado com um personagem: Cegueira, Envenenado, Maldição, Petrificação. **20 no seed.**

Vieram **antes** do catálogo de poções, e não depois, por uma razão de ordem: uma poção que cura Cegueira não significa nada enquanto Cegueira não existir. E condição não é alvo de poção — é o que skill, veneno, armadilha e monstro infligem; a poção é só uma das respostas, ao lado de Medicina e do tempo.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| nome | VARCHAR(100) | |
| efeito | TEXT | NOT NULL default `''` — o que acontece na prática. É o que a mesa lê |
| categoria | VARCHAR(20) | CHECK: Física, Mental, Mágica, Doença, Alquímica |
| raridade_item | INTEGER | **gravidade** — referência a `raridade.item` |
| duracao | VARCHAR(60) | texto livre |
| janela_de_cura | VARCHAR(60) | nullable — por quanto tempo a cura ainda funciona. Null = sem prazo |
| se_nao_tratada | TEXT | nullable — o que acontece passada a janela |
| acumulativa | BOOLEAN | se empilha de fontes diferentes |

**`raridade_item` é gravidade, e gravidade é a raridade da cura.** Uma condição Rara exige antídoto Raro, e a `dificuldade_base` da mesma linha de `raridade` é a DC para fabricá-lo. Uma escala serve aos dois lados sem coluna nova.

**`janela_de_cura` existe para Cegueira e Surdez.** Cicatrizada, nenhuma poção alcança — e sem um prazo gravado no dado, essa regra viveria só na cabeça do mestre.

#### O vínculo

`consumivel_condicao` liga os dois lados: `consumivel_id`, `condicao_id` e `acao` (CHECK `'cura'` | `'previne'` | `'inflige'`). **25 vínculos de poção (083) + 16 de veneno (090).**

`cura` remove o que já se sofreu; `previne` imuniza por um tempo; `inflige` aplica — é o veneno. São ações diferentes o bastante para o par (condição, ação) ser a chave — Selo da Vontade previne duas condições distintas sem curar nenhuma.

A API de condições devolve `tratada_por` (cura e previne) e `infligida_por` (inflige) **separados**: "tem cura?" e "quem causa?" são perguntas opostas, e misturá-las numa lista faria a tela dizer que um veneno "trata" a condição. **24 condições** hoje: as 20 originais e as 4 da classe farsante (Febre Fingida, Desmaio Breve, Estigma Falso, Morte Aparente), que passam sozinhas e trazem a DC de Medicina que revela a farsa.

`paranoid: false` e sem `updated_at`: o vínculo é detalhe do consumível, editado **como conjunto** (apaga tudo e reinsere), então nunca há o que atualizar numa linha e soft delete só acumularia lixo. É por isso que o índice único é **total**, não parcial.

**O que sustenta a integridade, já que não há FOREIGN KEY:**

- `ConsumiveisService.criar`/`editar` rodam **numa transação** — a validação das condições pode recusar o pedido, e sem transação o consumível ficava criado e sem vínculo
- `condicoes.condicoes[]` ausente no PATCH significa "não mexa"; array vazio significa "apague todos". Um PATCH que só muda o preço não pode desvincular sem querer
- apagar consumível apaga os vínculos de verdade (o consumível é soft delete, os vínculos não)
- apagar condição é **recusado** enquanto algum consumível **vivo** a tratar ou aplicar

Telas: `/master/condicoes` → `MasterCondicoesView.vue` (lista as condições com quem as trata); o vínculo se **edita** em `/master/consumiveis`, que é onde o mestre decide o que a poção faz.

### `itens` e `categoria_item` (migration 076)

Fecha o corte por comportamento. Aqui mora o que **só se carrega, vende ou entrega numa receita**: cosméticos, ferramentas, equipamento de exploração, materiais preciosos e ingredientes.

Todos se comportam igual — um batom e uma barra de mithril não precisam de tabelas separadas; separá-los compraria duas telas de admin e nada mais.

**Uma erva de alquimia é item, não consumível:** ela não some ao ser usada, ela vira outra coisa. Quem some é a poção que ela produz.

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | IDENTITY |
| nome | VARCHAR(255) | NOT NULL |
| descricao | TEXT | nullable |
| peso | NUMERIC(8,2) | nullable |
| valor | NUMERIC(12,2) | preço final em prata — mesma regra dos consumíveis |
| empilhavel | BOOLEAN | NOT NULL default TRUE — ervas e minérios empilham; uma gazua ou um vestido, não |
| raridade_item | INTEGER | referência a `raridade.item` |
| categoria_item | INTEGER | referência a `categoria_item.item` |

**Exceção de nomenclatura:** as outras tabelas usam `<lookup>_item` na coluna que referencia (`categoria_consumivel` → `categoria_consumivel_item`). Aqui isso daria `categoria_item_item`. Como o nome do lookup já termina em `_item`, a coluna ficou `itens.categoria_item`.

`categoria_item`: seed com Ingrediente, Material Precioso, Ferramenta, Exploração, Cosmético, e **Tecido** (migration 096). Apagar categoria em uso é recusado pelo serviço.

**`publico` e `bonus_social`** (migration 096, `docs/COSMETICOS.pdf`): só em tecido, material e cosmético. O **tecido** decide quem a roupa impressiona (plebe / qualquer / nobreza) e a roupa herda; a **qualidade da fabricação** decide quanto — bem feita dá o `bonus_social` (+1/+2/+3 por tier), mal feita dá 0, obra-prima +1. Roupa de nobreza diante da plebe (ou o inverso) dá −1. Acessório dá +1 fixo e só um conta. O bônus será lido do item com `equipado = true` em `data.inventario`; não há motor de teste social ainda. 8 tecidos, 6 materiais, 10 roupas e 6 acessórios, com as primeiras receitas de **Costura** e **Joalheria** — que já exigem as ferramentas da 094.

Tela: `/master/itens` → `MasterItensView.vue`.

### `receitas` e `receita_ingredientes` (migration 077)

O que produz o quê, com o quê. **Não cabe como coluna de nenhuma tabela de item**: é muitos-para-muitos (uma poção usa três ingredientes; um ingrediente serve a cinco poções) e cruza tabelas (uma espada élfica precisa de mithril, que é `itens`, e produz um `equipamentos`).

Daí o par **`<coisa>_tabela` + `<coisa>_id`** nos dois lados, com `CHECK` no banco nos nomes permitidos (`consumiveis`, `itens`, `equipamentos`). Sem o CHECK, `'consumivel'` no singular passaria e o JOIN silenciosamente não acharia nada.

| `receitas` | Tipo | Notas |
|---|---|---|
| nome / descricao | VARCHAR(255) / TEXT | |
| produto_tabela + produto_id | VARCHAR(20) + INTEGER | o que a receita produz |
| quantidade_produzida | INTEGER | NOT NULL default 1 |
| tempo_minutos | INTEGER | em minutos, para caber "20 min" e "dois dias" |
| dificuldade | INTEGER | a DC do teste — `raridade.dificuldade_base` do produto (10/15/20) |
| pericia_id | INTEGER | referência a `pericias.id`. **Alquimia** nas 44 receitas de poção e veneno, **Cozinha** nas 12 de prato. Preenchida desde a 083; a 091 trouxe a primeira perícia que não é Alquimia. Exposta na API como `pericia_id` — não era, e a tela de receitas não sabia dizer o ofício |

**Sem UNIQUE em (produto_tabela, produto_id)** de propósito: caminhos alternativos para o mesmo produto são desejáveis.

`receita_ingredientes` tem `quantidade` e **`consumido`** — falso para ferramenta, que é exigida mas não some ao usar. Sem essa coluna o jogador perderia o alambique a cada poção. **Desde a migration 094 toda receita exige ferramenta**: as 44 de Alquimia pedem Alambique + Almofariz e Pilão; as 12 de Cozinha pedem Espeto e Grelha (assado, grelhado, brasa) ou Panela de Ferro. As 19 ferramentas (`docs/FERRAMENTAS.pdf`) são todas Comuns, preço fixo, `empilhavel = false`; acima de 12 kg a ferramenta é **fixa** — o peso decide, não uma coluna. É a única tabela do projeto com **`paranoid: false`**: os ingredientes são detalhe da receita, editados como conjunto (apaga tudo e reinsere), e por isso o índice único pode ser total.

**Margem do crafting:** a API calcula `custo_dos_ingredientes`, `preco_de_compra` e `proporcao_do_preco` a cada leitura. O alvo do projeto é **70–75%** — abaixo disso ninguém compra pronto; acima, fabricar não compensa o risco. A tela mostra a proporção enquanto o mestre edita, colorida por faixa. Só o que é `consumido` entra no custo.

Tela: `/master/receitas` → `MasterReceitasView.vue`.

### `pericias` (migration 078)

A **terceira trilha de progressão**, ao lado do nível de personagem e do nível de classe:

| Trilha | Concede | De onde vem |
|---|---|---|
| Nível de personagem | atributos (status) | XP, concedido pelo mestre |
| Nível de classe | pontos de classe → skills | pontos concedidos pelo mestre |
| **Perícia** | ranks, e o teste de d20 que os usa | passado + downtime + marco de nível |

Existe separada porque as outras não servem: ninguém fica melhor em cozinhar matando goblins, e se o ponto de perícia saísse da mesma fonte do nível as duas seriam a mesma progressão com nomes diferentes.

| Coluna | Tipo | Notas |
|---|---|---|
| nome | VARCHAR(100) | UNIQUE parcial entre as ativas |
| descricao | TEXT | NOT NULL default `''` |
| atributo_base | VARCHAR(20) | CHECK nos 5 atributos — qual entra no teste |
| categoria | VARCHAR(20) | CHECK: Ofício, Social, Corpo, Saber |

CHECK em vez de tabela de lookup nos dois casos: os cinco atributos são estruturais do sistema, e as quatro categorias são rótulos que não carregam dado nenhum.

**21 perícias no seed.** Crafting não é uma perícia só — um alquimista não é um ferreiro, e `receitas.pericia_id` aponta para a específica.

#### O teste

```
d20 + (rank × 3) + min(⌊atributo_base ÷ 2⌋, rank × 2)   vs   dificuldade
```

O atributo entra **pela metade** de propósito: com 10 pontos no onboarding mais o bônus do passado, um atributo focado chega a 13 e engoliria o rank; dividido, o rank (até +15) domina — que é o certo para uma perícia.

**O `min` é o teto (migration 081).** Sem ele, um personagem de fim de campanha com Inteligência alta passava em quase tudo com rank 1 em toda perícia — o atributo pagava o que o treino deveria pagar. Amarrado a `rank × 2`, o atributo só contribui até onde o treino já chegou: rank 1 aproveita no máximo +2 do atributo, rank 5 aproveita até +10. A mesma conta vive em `client/src/lib/api/pericias.api.ts` e em `server/.../pericia.model.ts` — se mudar, mude nos dois.

**Rank 0 é "não treinado" e não pode tentar.** Sem isso, quem tem Inteligência alta fabrica poções sem nunca ter estudado alquimia.

A `dificuldade_base` de `raridade` (10/15/20/25) **é a DC do teste**: fabricar algo Comum é DC 10, Épico é DC 25. As duas tabelas já conversavam sem precisar de coluna nova.

#### De onde vêm os pontos

1. **Passado** — `passados.pericias_iniciais`, lista de `{periciaId, rank}`. São ranks de graça, copiados para `data.pericias` ao escolher o passado. Copiados, e não lidos do catálogo como skills e títulos, porque o jogador compra ranks **por cima** destes — sem a cópia não haveria como separar origem de compra. Copiar é seguro porque o passado é permanente.
2. **Downtime** — `POST /personagens/admin/:id/pontos-pericia`. A fonte principal, e de propósito sem automação: representa tempo de jogo, não XP de combate.
3. **Marco de nível** — 1 ponto por marco atravessado, em `atribuirXpAoPersonagem`. **É a única coisa que subir de nível concede sozinho neste projeto.** Conta marcos e não níveis: a tabela tem 27 marcos para 100 níveis, e pular de 5 para 10 é um marco, não cinco.

#### Custo dos ranks

Crescente: rank N custa N pontos. Rank 5 numa perícia custa 1+2+3+4+5 = **15**; rank 1 em cinco perícias custa **5**. Especialista e generalista viram escolhas com peso.

Os ranks do personagem vivem em `data.pericias` (`[{periciaId, nome, rank, rankInicial?}]`) e os pontos em **duas bolsas**, seguindo o padrão de `data.classes` e `data.skills`.

#### Virtude, e as duas bolsas (migrations 081, 084, 085 e 086)

`pericias.bolsa` divide o catálogo em `mundana` e `virtude`. A de Virtude tem cinco perícias — **Luta, Magia, Reflexo, Fortitude, Pontaria** — e gasta uma bolsa própria:

| Bolsa | Campo em `characters.data` | De onde vem |
|---|---|---|
| `mundana` | `periciaPoints` | passado, downtime, marco de nível de personagem |
| `virtude` | `periciaPointsVirtude` | **marcos de nível de classe** |

**Bolsas separadas porque uma só faria o guerreiro pagar duas vezes.** Competência em combate já custa pontos de classe; se Luta saísse da mesma bolsa de Alquimia, o guerreiro compraria o que já comprou usando o dinheiro do alquimista. `CAMPO_DA_BOLSA` (em `pericia.model.ts`) é o mapa que o serviço de progressão consulta ao debitar.

`classe_marco_virtude` guarda quantos pontos cada classe concede nos níveis **5, 10, 15 e 20** — 116 linhas, as 29 classes. Crescente de propósito (o marco 20 vale mais que o 5), o que premia levar a classe até o fim em vez de colecionar começos.

**Por marco de classe, e não por nível de classe.** Um jogador pode ter até 5 classes, ou seja 100 níveis; a 2 pontos por nível o teto chegaria no nível 37 de 100 e o resto da campanha não acrescentaria nada. Já **100 níveis dão 20 marcos não importa como sejam divididos** — cinco classes até 20, dez até 10, vinte até 5. O orçamento parou de multiplicar com o número de classes. Melhor cenário 50 pontos, pior 40; maximizar as cinco perícias custaria 75, então **nunca satura**.

O crédito acontece em `atribuirXpDeClasse`, somando os marcos **atravessados** entre o nível anterior e o novo. `nivelInicial` é capturado **antes** do laço de level-up — lido depois, seria igual ao nível novo e a conta devolveria zero em silêncio.

**Rank 5 concede uma capacidade, não um número maior** (migration 084). Medido: no rank 5 o personagem já passa DC 20 em 100% das rolagens, então qualquer bônus numérico a mais não compra nada. Ex.: Luta rank 5 faz os ataques ignorarem a resistência física do alvo.

`class_level_progression` precisa estar **populada** para tudo isso funcionar: `atribuirXpDeClasse` consulta a tabela para saber o custo do próximo nível, e com ela vazia o XP entrava e o nível não subia — sem erro nenhum, deixando o crédito de marcos como código morto. A migration 086 semeia `120 × nível` para as 29 classes, como ponto de partida editável em `/master/progressao`.

### Inventário estruturado e a ação de fabricar (migration 095 + código)

Desenho completo em `docs/FABRICAR.pdf`. Dois módulos novos, `inventario` e `fabricacao`, ambos sob `personagens/:id/`.

**`data.inventario`** é uma lista de `{tabela, id, quantidade, qualidade, rapido, equipado}`. `tabela` é `itens` | `consumiveis` | `equipamentos` — o mesmo par tabela+id de `receitas`. Duas entradas são a mesma pilha quando casam nos cinco campos que a definem; a mesma poção pode aparecer duas vezes, uma na mochila rápida e outra fora. Por isso as rotas de remover e alternar trabalham por **posição na lista**, não por id. Empilha se `itens.empilhavel`; consumível sempre empilha; equipamento nunca. O peso da barra de carga soma do catálogo (`2 + força × 2` continua a regra). O onboarding grava aqui e **lê o peso do catálogo** — antes somava o `peso` que o cliente mandava, e bastava enviar 0.

**A ação (`POST /personagens/:id/fabricar`)** faz sete checagens que dizem *o que falta* ("Faltam ingredientes: 2× Erva de Sangue" / "Falta no inventário: Alambique"), rola `d20 + bonusDoTeste(rank, atributo)` **no servidor** (como o dinheiro inicial: no cliente bastaria recarregar até sair 20), e consome insumos + entrega o produto + grava em `fabricacoes` numa transação. Ferramenta portátil (≤ 12 kg) precisa estar no inventário; fixa exige `oficina_disponivel: true` — a ação não sabe onde o personagem está. `GET .../checar` faz só as checagens e devolve as chances das quatro saídas, para a tela desabilitar o botão com o motivo escrito.

**A escada de qualidade, uma só para todo ofício** (constantes em `fabricacao.service.ts` e em `regras_do_sistema` como `fabricar.*`): desastre a DC−10 (nada sai, insumos perdidos), mal feito abaixo da DC, bem feito na DC, obra-prima a DC+15. Assimétrica de propósito: com ±10, rank 1 tirava obra-prima em 30% das poções Comuns. **O motor grava a qualidade no item produzido; cada catálogo diz o que ela vale** — poção turva satura, poção límpida não satura, veneno diluído/concentrado é DC −5/+5, prato mal feito cura 1d4, roupa mal feita dá bônus 0. Qualidade nunca salta de tier: uma Poção de Cura Menor obra-prima é uma Menor límpida, não uma Maior.

`fabricacoes` é histórico: sem soft delete, sem `updated_at`. `character_id`, `receita_id`, `rolagem_d20`, `bonus`, `dificuldade`, `resultado` (CHECK nas quatro), `oficina_confirmada`, `created_by`.

**Telas:** `InventarioPersonagem.vue` e `FabricarPainel.vue`, na aba Inventário do Dashboard — os dois primeiros componentes **mobile-first** do site. A escolha de receita é uma lista com busca, não um `VSelect`: um dropdown que abre para baixo no fim da página fica cortado no celular. Os dois se avisam por `ref`: adicionar um insumo re-checa a fabricação; fabricar recarrega o inventário.

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
| atributo_bonus | JSONB | bônus somado aos atributos no onboarding |
| dinheiro_inicial | JSONB | **NOT NULL**, default `[]` (migration 071) — ver abaixo |
| created_at / updated_at | timestamptz | |
| created_by / updated_by | TEXT | email do autor |
| deleted_at / deleted_by | timestamptz / TEXT | soft delete |

**`dinheiro_inicial` é uma LISTA de rolagens**, não um valor:

```json
[{"quantidade": 1, "faces": 100, "moeda": "prata"},
 {"quantidade": 1, "faces": 4,   "moeda": "ouro"}]
```

Lista porque um passado pode conceder mais de um dado e em mais de uma moeda — é o caso do Aventureiro. Moedas: `bronze`, `prata`, `ouro`. Até a migration 071 isso vivia escrito em português no fim da `descricao`, onde nada conseguia rolar. A migration extraiu os valores e **removeu a linha da descrição**, para os dois não discordarem depois.

Backend retorna passado enriquecido: além dos IDs, inclui `skills: [{id,name}]` e `titulos: [{id,name}]`.
Tela: `/master/passados` → `MasterPassadosView.vue`.
API: `GET /api/passados` (público), `POST/PATCH/DELETE /api/passados/admin[/:id]` (isMaster).

### `lore_notes`

Notas de lore que o mestre publica. Ver migrations 009–011; PK convertida para INTEGER IDENTITY (migration 022).

`character_id INTEGER` nulo significa nota **global** (todos veem); preenchido, a nota só aparece para aquele personagem. A coluna existia como `uuid` desde a migration 010, sumiu durante a conversão de PKs para INTEGER, e **o backend continuou filtrando e gravando por ela** — o que deixou todas as rotas do módulo quebradas contra o esquema real até a migration 068 devolvê-la. Não apareceu antes porque a tabela está vazia.

`content` é NOT NULL com default `''`.

**Formato e capas (migration 098):** `formato` é `'livro'` (padrão), `'pergaminho'`, `'bilhete'` ou `'carta'` (os três últimos desde a 099) — só o livro abre com capa e vira folha; os outros são uma folha só com a cara do formato (`PergaminhoLeitor.vue`). `capa_url` e `contracapa_url` guardam caminho relativo em `uploads/lore/`; sem capa o leitor desenha a padrão (moldura e dados dourados, `CapaDoLivro.vue`), e **sem contracapa repete a capa sem o título**. No fim do livro, avançar fecha pela contracapa — o livro fica virado, com ela à vista.

**Mundo e acesso (migration 099):** cada nota pertence a uma campanha (`campaign_id NOT NULL` — o primeiro catálogo escopado por mundo, ver `docs/MUNDOS.md`) e é liberada por `visibilidade`: `todos` (todo personagem do mundo), `escolhidos` (só quem está em **`lore_note_acesso`**, tabela de conjunto `(lore_note_id, character_id)` UNIQUE total e sem soft delete, como `npc_acesso_player`) ou `ninguem` (rascunho). A coluna `character_id` de antes saiu. **A lista só existe quando a visibilidade é `escolhidos`** — marcar `todos` ou `ninguem` apaga as linhas, para nunca haver "todos, mas com uma lista guardada". Todo personagem da lista precisa ser do mesmo mundo da nota (400 se não for). O jogador lê pelo personagem (`campaign_id` do personagem + `todos` ou linha de acesso); o mestre administra tudo em `/master/livros`. Os arquivos (PDF, capas) continuam estáticos públicos em `/uploads/`: o acesso protege a prateleira, não o arquivo.

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

**`level_progression`** é a do **personagem**: `level` (**UNIQUE**), `tier`, `multiplier`, `xp_required_next` e `xp_total_accumulated`. 27 níveis cadastrados. É a tabela que `atribuirXpAoPersonagem` percorre para decidir o nível a partir do XP acumulado: **`xp_total_accumulated(N)` é o XP total em que o personagem *chega* ao nível N** — nível 1 = 0, nível 2 = 120, nível 100 = 1.050.000 (migration 097; antes a linha do nível 1 dizia 120, como se houvesse um nível 0, e o nível 2 só vinha com 360). `xp_required_next` é a diferença até a próxima linha, que nas linhas esparsas (5 → 10) é o custo do marco inteiro. O código-fonte da migração anterior consultava colunas que não existem aqui (`nivel`, `xp_necessario`), então **o XP nunca subia o nível de ninguém** até isso ser corrigido.

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
- **Reset Padrão** (botão orange, GM e player): senha vira `12345` e `requires_password_change = true`. No próximo login o modal obrigatório de troca aparece — em **qualquer** rota autenticada, porque `TrocaDeSenhaObrigatoria` está montado em `App.vue`. Antes ele vivia copiado no Dashboard e no painel do mestre, o onboarding nunca o mostrava, e o flag só existia na memória do store: um F5 restaurava a sessão sem ele e o jogador ficava com `12345` para sempre. Hoje `precisaTrocarSenha` é gravado no `rpg-mesa.auth-meta` junto com a sessão, e `GET /api/auth/eu` também o devolve, lido do banco

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
8. Mestre aprova, **escolhendo o mundo** no modal (sugerido pela solicitação, ou o único ativo): o backend preenche o pré-registro em `usuarios` **transferindo o hash** já pronto e cria o registro em `characters` com esse `campaign_id`. Se a criação do personagem falhar, a conta é desfeita para não ficar órfã. Sem campanha a aprovação é recusada — a solicitação chega sem `campaign_id` quando o jogador se cadastrou pelo `/login` direto, e o personagem nascia invisível para todo mundo
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
| 2b — Skill inicial | `POST /api/personagens/:id/escolher-skill-inicial` | Sim | Só aparece se a classe tiver `starting_skills`. Gasta 1 ponto de skill e sobe o nível da classe. **A mesma rota atende toda skill aprendida pelo dashboard** — por isso ela confere que a skill existe, pertence à classe (`starting_skills` ou `required_class`) e respeita `nivel_minimo_classe`, e o nível **não passa de 20**. Sem isso, com o token na mão dava para se conceder a skill de outra classe, e no nível 20 cada skill subia a classe além do teto |
| 3 — Passado | `PATCH /api/personagens/:id/escolher-passado` | Sim | Atualiza `characters.passado_id`. As skills e títulos do passado **não** são copiados para o personagem — o dashboard os lê do catálogo de passados na hora de exibir |
| 4 — Atributos | `PATCH /api/personagens/:id/definir-atributos` | Sim | Salva em `data.atributos` |
| 5 — Deus | `PATCH /api/personagens/:id/escolher-deus` | Sim | Atualiza `characters.deus_id`; pode ser pulado |
| 6a — Dinheiro | `POST /api/personagens/:id/rolar-dinheiro-inicial` | Sim | Rola o `dinheiro_inicial` do passado; grava em `data.dinheiro_inicial` |
| 6 — Equipamentos | `PATCH /api/personagens/:id/concluir-onboarding` | — | Salva `data.equipamentos_iniciais`; seta `onboarding_completo = true` |

**Navegação entre etapas:** o player transita livremente entre as etapas já concluídas — pelo stepper do topo (clicável) ou pelos botões **Voltar / Avançar** no rodapé. `etapaMaxima` guarda a etapa mais longe já alcançada e limita os dois. Ao concluir a etapa 6, é redirecionado para `/dashboard`.

**Dinheiro inicial (etapa 6):** o jogador rola os dados que o passado dá. São **duas tentativas no máximo**; a segunda substitui a primeira mesmo se vier pior, e o valor descartado fica gravado em `data.dinheiro_inicial.descartado`.

**O dado é rolado no servidor**, nunca no navegador — no cliente bastaria recarregar a página até sair o valor máximo, e a regra das duas tentativas não significaria nada. A rota não aceita corpo: o que rolar vem do passado do personagem.

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
- Classes do personagem. "Ganhar pts. skill" (1 ponto de classe → 1 de skill) e a compra de rank de perícia pedem confirmação: são irreversíveis e, no celular, ficam sob o polegar
- **Atributos** (após onboarding): barras coloridas para Aura, Força, Destreza, Resistência, Inteligência
- **Perícias** com as **duas bolsas** (`periciaPoints` e `periciaPointsVirtude`): cada perícia habilita pela bolsa que ela gasta, como `CAMPO_DA_BOLSA` no servidor. A tela só conhecia a mundana, e o jogador comprava Luta "dos 26 pontos" enquanto a Virtude caía em silêncio
- **Origem**: cards com raça, passado e deus (carregados via APIs públicas em background)
- Skills e títulos concedidos — a skill do passado aparece aqui com o selo "passado", já que não é copiada para `data.skills`
- Notas de aventura (preview)

**Tab "Inventário":** `InventarioPersonagem` (carga, busca no catálogo para adicionar, e os grupos Equipado / Mochila rápida / Mochila com os selos de qualidade) e `FabricarPainel` (receitas ao alcance, checagem com o que falta, chances, e o resultado da rolagem). Ver "Inventário estruturado e a ação de fabricar".

## Storage (disco local)

Arquivos ficam em `uploads/<subpasta>/<nome>.<ext>` e são servidos em `/uploads/...`. **O banco guarda o caminho relativo** (`gods/pharasma.png`); a URL completa é montada na resposta a partir de `PUBLIC_BASE_URL`.

Subpastas: `gods`, `maps`, `racas`, `passados`, `npcs`, `campanhas`, `lore` (PDF de nota), `personagens` (avatar e história anexados a um pedido de alteração) e `pendentes` (avatar e história de solicitação de criação).

Cada módulo expõe a própria rota de upload — todas exigem mestre, exceto as de `character-creation-requests` (públicas, porque quem submete ainda não tem conta) e as de `personagens/:id/*`, que exigem ser dono do personagem.

Nomes de arquivo são higienizados e recebem sufixo numérico só em colisão real com conteúdo diferente — arquivo idêntico reaproveita o mesmo nome.

## Backup de Imagens

Tela `/master/imagens` (`MasterImagesView.vue`) mostra todas as imagens do projeto em 4 seções: Personagens, Deuses, Mapas, Raças. Cada imagem tem botão de download individual. Cada seção tem "Baixar tudo" que gera um ZIP com pasta nomeada (ex: `DEUSES.zip/DEUSES/`). Botão global "Baixar tudo" gera `IMAGENS.zip` com subpastas para cada seção. Usa JSZip no browser.
