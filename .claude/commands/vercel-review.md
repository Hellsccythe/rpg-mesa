Você é um especialista em deploy, performance web e infraestrutura Vercel. Analise as configurações do projeto rpg-mesa e retorne um relatório completo seguindo esses passos:

## 1. Configuração Atual do Vercel

- Leia o arquivo `vercel.json` e avalie: buildCommand, outputDirectory, rewrites, headers, redirects
- Verifique se o `buildCommand` compila client e server corretamente
- Verifique se o `api/index.js` está configurado corretamente como serverless function
- Identifique variáveis de ambiente necessárias mas não documentadas (procure por `import.meta.env.VITE_` no client e `process.env.` no server)
- Liste todas as env vars encontradas e classifique: obrigatória / opcional / sensível

## 2. Serverless Function (Backend Express)

- Analise `server/src/app.ts` e avalie compatibilidade com ambiente serverless
- Identifique pacotes com binários nativos (ex: `sharp`) e verifique se funcionam no Vercel
- Verifique timeout: funções Vercel têm limite de 10s (hobby) ou 60s (pro) — identifique operações lentas
- Verifique cold start: imports pesados no topo do arquivo aumentam latência
- Aponte conexões que deveriam ser lazy (ex: clientes Supabase instanciados globalmente)
- Verifique se o Express está exportando corretamente para o handler do Vercel

## 3. Build e Bundle

- Leia `client/vite.config.ts` e avalie: chunking, minification, sourcemaps, target
- Identifique chunks grandes (imports que deveriam ser lazy com `import()`)
- Verifique se `@supabase/supabase-js` e outras libs pesadas estão sendo tree-shaken
- Aponte imports de barrel files que impedem tree-shaking
- Verifique se assets (imagens, fontes) têm otimização adequada
- Avalie se o `outputDirectory` corresponde ao `outDir` do vite config

## 4. Performance de Rede

- Verifique se o `vercel.json` configura headers de cache para assets estáticos
- Identifique endpoints da API que deveriam ter cache-control headers
- Verifique se imagens servidas pelo Supabase Storage passam por otimização
- Avalie se há oportunidade de usar Vercel Edge Functions para rotas simples
- Verifique se o CORS está configurado corretamente para o domínio Vercel

## 5. Segurança no Deploy

- Liste todas as env vars sensíveis (SERVICE_ROLE_KEY, senhas, tokens) e verifique se alguma está hardcoded no código
- Verifique se o `SUPABASE_SERVICE_ROLE_KEY` nunca é exposto no client (prefixo VITE_)
- Avalie se o `api/index.js` tem proteção adequada (rate limit, validação de origem)
- Verifique se os headers de segurança estão configurados no vercel.json (X-Frame-Options, CSP, etc.)
- Identifique rotas `/admin` que não verificam autenticação no middleware Express

## 6. Monorepo e Dependências

- Leia o `package.json` raiz e avalie a estrutura de workspaces (client + server)
- Verifique se o `installCommand` no vercel.json instala dependências de todos os workspaces
- Identifique dependências duplicadas entre client e server que poderiam ser hoisted
- Verifique a versão do Node.js usada (`.nvmrc`, `engines` no package.json) e compatibilidade com Vercel
- Avalie se `devDependencies` do server estão sendo incluídas desnecessariamente no bundle

## 7. Estratégia de Deploy

- Avalie se a arquitetura atual (frontend Vercel + backend serverless) é adequada para o projeto
- Identifique gargalos: operações que não funcionam bem como serverless (WebSockets, processos longos, uploads grandes)
- Verifique se o upload de arquivos (avatar, documentos) usa Supabase Storage diretamente do client ou passa pelo servidor
- Sugira se vale migrar o backend para Railway/Render/Fly.io dado o perfil de uso
- Avalie custo estimado no plano Hobby vs Pro do Vercel para este projeto

## 8. Prioridades e Plano de Ação

Monte uma tabela com os problemas encontrados, classificados por:
- **Impacto**: Alto / Médio / Baixo
- **Esforço**: Alto / Médio / Baixo
- **Categoria**: Config / Performance / Segurança / Build / Arquitetura

Sugira a ordem de implementação começando pelo quadrante Alto Impacto + Baixo Esforço.

Inclua snippets de código ou configuração prontos para aplicar onde possível.
