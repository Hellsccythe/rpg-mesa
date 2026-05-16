# Componentes Compartilhados — RPG Mesa

Todos os componentes ficam em `client/src/components/`.

---

## DataTable

**Arquivo:** `components/DataTable.vue`  
**Propósito:** Padrão de listagem CRUD para views admin do mestre. Encapsula container, cabeçalho, estado de carregamento, estado vazio, linhas alternadas e botões de editar/deletar.

> **Regra do projeto:** toda listagem tabular de gerenciamento (master panel) deve usar este componente.

### Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `colunas` | `ColunaTabela[]` | ✓ | — | Definição das colunas do cabeçalho |
| `itens` | `unknown[]` | ✓ | — | Array de dados a renderizar |
| `classeGrid` | `string` | ✓ | — | Classes Tailwind de grid (ex: `"grid grid-cols-[2fr_1fr_3rem] items-center gap-3"`) |
| `carregando` | `boolean` | — | `false` | Exibe spinner no lugar das linhas |
| `mensagemVazia` | `string` | — | `""` | Texto exibido quando `itens` está vazio |
| `semAcoes` | `boolean` | — | `false` | Oculta a coluna de ações |

#### `ColunaTabela`

```typescript
interface ColunaTabela {
  label: string    // texto do cabeçalho
  classe?: string  // classes extras para a célula (ex: "hidden sm:block")
}
```

### Emits

| Evento | Payload | Descrição |
|---|---|---|
| `editar` | `item: unknown` | Disparado ao clicar no botão de edição |
| `deletar` | `item: unknown` | Disparado ao clicar no botão de exclusão |

### Slots

| Slot | Escopo | Descrição |
|---|---|---|
| `#linha` | `{ item, index }` | Conteúdo das células de dados (todas exceto ações) |
| `#vazia-cta` | — | CTA opcional exibido abaixo da mensagem de vazio |
| `#acoes` | `{ item }` | Substitui os botões padrão de editar/deletar |

### Exemplo completo

```vue
<DataTable
  :colunas="[
    { label: 'Nome' },
    { label: 'Tipo', classe: 'hidden sm:block' },
    { label: 'Status' },
  ]"
  classe-grid="grid grid-cols-[2fr_1fr_1fr_3rem] items-center gap-3"
  :itens="itensFiltrados"
  :carregando="carregando"
  mensagem-vazia="Nenhum item cadastrado."
  @editar="iniciarEdicao"
  @deletar="confirmarDelete"
>
  <template #linha="{ item }">
    <p class="truncate text-sm font-semibold">{{ (item as MeuTipo).nome }}</p>
    <span class="hidden sm:block text-xs text-zinc-400">{{ (item as MeuTipo).tipo }}</span>
    <span class="text-xs">{{ (item as MeuTipo).status }}</span>
  </template>

  <template #vazia-cta>
    <button @click="abrirForm" class="text-xs text-red-400 underline">
      Cadastrar primeiro item
    </button>
  </template>
</DataTable>
```

### Nota sobre `classeGrid`

O valor de `classeGrid` deve incluir `grid`, as colunas e `items-center gap-3`. A **última coluna** deve ter largura `3rem` — reservada para os botões de ação gerados automaticamente.

```
"grid grid-cols-[2fr_1fr_3rem] items-center gap-3"
                          ^^^^ sempre reservar para ações
```

Para responsividade, use variantes `sm:`:
```
"grid grid-cols-[1fr_auto_3rem] items-center gap-3 sm:grid-cols-[2fr_1fr_1fr_3rem]"
```

### Dark / Light mode

O componente aplica estilos para ambos os temas via `:global(html.theme-light)`. Nenhuma configuração extra necessária na view.

---

## Modal

**Arquivo:** `components/Modal.vue`  
**Propósito:** Modal genérico com overlay escurecido, transição, slot de header e body.

### Props (principais)

| Prop | Tipo | Descrição |
|---|---|---|
| `showCloseButton` | `boolean` | Exibe botão × no canto |
| `overlayClass` | `string` | Classes extras do overlay |
| `panelClass` | `string` | Classes extras do painel |
| `bodyClass` | `string` | Classes extras do corpo |
| `headerClass` | `string` | Classes extras do header |

### Slots

- `#header` — conteúdo do topo do modal
- `default` — corpo principal

### Exemplo

```vue
<Modal
  v-if="mostrar"
  panel-class="max-w-lg"
  body-class="p-6"
  @close="fechar"
>
  <template #header>
    <h2>Título</h2>
  </template>
  <p>Conteúdo do modal...</p>
</Modal>
```

---

## TemaDarkLight

**Arquivo:** `components/TemaDarkLight.vue`  
**Propósito:** Wrapper que aplica variáveis CSS do tema ativo (`dark`/`light`). Deve envolver o conteúdo principal de cada view.

### Props

| Prop | Valores | Descrição |
|---|---|---|
| `variante` | `"contexto"` \| `"base"` | Estilo de superfície |

### Uso

```vue
<TemaDarkLight variante="contexto" class="flex min-h-screen flex-col">
  <!-- conteúdo da view -->
</TemaDarkLight>
```

---

## VSelect

**Arquivo:** `components/VSelect.vue`  
**Propósito:** Select customizado com suporte a tema e estilo unificado.

---

## SuperficieTema

**Arquivo:** `components/SuperficieTema.vue`  
**Propósito:** Superfície card/container com estilo do tema ativo.

---

## HamburgerDrawerMenu

**Arquivo:** `components/HamburgerDrawerMenu.vue`  
**Propósito:** Menu lateral acessível por botão hambúrguer, usado na navegação mobile.

---

## Convenções de Estilo

Todos os componentes seguem o mesmo padrão de CSS:

- **Dark mode** (padrão): cores diretas com `rgb()` e opacidades
- **Light mode**: overrides via `:global(html.theme-light) .classe`
- **CSS scoped** por componente — sem vazamento de estilos

Variáveis CSS disponíveis no light mode:

| Variável | Uso |
|---|---|
| `--bg-page` | Fundo da página |
| `--bg-card` | Fundo de cards/containers |
| `--bg-soft` | Fundo suave (hover, alternância) |
| `--text-main` | Texto principal |
| `--text-muted` | Texto secundário |
| `--border-soft` | Borda suave |
| `--accent-soft` | Destaque suave (hover) |
