Você é um especialista em UX/UI especializado em interfaces para jogos de RPG de mesa. Analise o frontend Vue 3 do projeto e retorne um relatório completo seguindo esses passos:

## 1. Inventário de Componentes

- Liste todos os componentes Vue em `src/components/` e `src/views/`
- Para cada um, identifique: responsabilidade, props recebidas, eventos emitidos
- Aponte componentes grandes demais que deveriam ser divididos (mais de ~200 linhas)
- Identifique lógica de negócio que deveria estar em composables e não no template

## 2. Responsividade

- Verifique se os componentes usam breakpoints adequados (mobile-first)
- Identifique elementos com largura fixa em px que quebram em telas pequenas
- Aponte tabelas, grids ou listas sem adaptação para mobile
- Verifique se fichas de personagem e mapas são usáveis em telas de 375px (iPhone SE)
- Sugira melhorias específicas para uso durante sessões de RPG (uma mão ocupada com dados)

## 3. Acessibilidade

- Verifique uso de atributos semânticos: `aria-label`, `role`, `alt` em imagens
- Identifique botões sem texto acessível (só ícone sem aria-label)
- Verifique contraste de cores entre texto e fundo (mínimo WCAG AA: 4.5:1)
- Aponte inputs sem `<label>` associado
- Verifique se a navegação por teclado (Tab/Enter) funciona nos fluxos principais
- Identifique modais/overlays sem foco preso (focus trap)

## 4. Tema RPG e Identidade Visual

- Avalie se a interface transmite atmosfera de fantasia medieval
- Verifique consistência visual: fontes, paleta de cores, bordas, ícones
- Identifique elementos genéricos que poderiam ter tratamento temático (botões, cards, inputs)
- Sugira micro-interações adequadas ao tema (ex: sons, animações de pergaminho, partículas)
- Verifique se avatares, mapas e fichas de personagem têm apresentação imersiva

## 5. Fluxos Críticos de Usabilidade

Analise especificamente estes fluxos e aponte fricções:
- **Login / Registro de personagem**: quantos cliques/passos até estar jogando?
- **Ficha de personagem**: as informações mais acessadas estão visíveis sem scroll?
- **Mapa de cidade**: pontos de interesse são clicáveis e legíveis em mobile?
- **Painel do Mestre**: aprovação de solicitações e gerenciamento de emails é eficiente?

## 6. Performance Percebida

- Identifique imagens sem `loading="lazy"` ou sem dimensões definidas (causa layout shift)
- Verifique se há listas longas sem virtualização (ex: v-for sem paginação)
- Aponte componentes que fazem fetch a cada montagem sem cache
- Verifique se estados de loading e erro estão implementados em todos os fetches

## 7. Prioridades e Plano de Ação

Monte uma tabela com as melhorias encontradas, classificadas por:
- **Impacto**: Alto / Médio / Baixo
- **Esforço**: Alto / Médio / Baixo
- **Categoria**: Responsividade / Acessibilidade / Tema / Usabilidade / Performance

Sugira a ordem de implementação começando pelo quadrante Alto Impacto + Baixo Esforço.
