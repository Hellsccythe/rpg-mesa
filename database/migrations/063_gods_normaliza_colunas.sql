-- Migration 063: Normaliza os campos de gods para colunas reais
--
-- A tabela guardava os mesmos dados em dois lugares: colunas reais (title,
-- dogma, anatema, weapons, short_description, indole) e uma cópia dentro do
-- JSONB "data". Era por isso que o service tinha um helper lendo de quatro
-- lugares diferentes (coluna camelCase, coluna snake_case, JSONB camelCase,
-- JSONB snake_case).
--
-- Os campos de texto já estavam preenchidos nas colunas nos 21 registros; só
-- a imagem estava inconsistente (coluna image_url em 5 de 21, JSONB em 21).
--
-- Esta migration é a etapa "migrar" de um expand/migrate/contract: preenche
-- as colunas e converte as URLs, mas NÃO apaga o JSONB "data" nem a coluna
-- image_path. A remoção dessas duas fica para uma migration futura, depois
-- que o código novo estiver rodando estável — assim existe caminho de volta.
--
-- As URLs das imagens apontavam para o Supabase Storage, que vai sair do ar.
-- Passam a guardar o caminho relativo ("gods/pharasma.webp"); a URL completa
-- é montada em runtime a partir de PUBLIC_BASE_URL, para que publicar em
-- outro host não exija reescrever linha nenhuma.

BEGIN;

-- 1) Preenche colunas de texto que porventura estejam vazias, a partir do JSONB
UPDATE public.gods
SET title = COALESCE(NULLIF(title, ''), data->>'title', '')
WHERE COALESCE(title, '') = '' AND data->>'title' IS NOT NULL;

UPDATE public.gods
SET indole = COALESCE(NULLIF(indole, ''), data->>'indole', '')
WHERE COALESCE(indole, '') = '' AND data->>'indole' IS NOT NULL;

UPDATE public.gods
SET dogma = COALESCE(NULLIF(dogma, ''), data->>'dogma', '')
WHERE COALESCE(dogma, '') = '' AND data->>'dogma' IS NOT NULL;

UPDATE public.gods
SET anatema = COALESCE(NULLIF(anatema, ''), data->>'anatema', '')
WHERE COALESCE(anatema, '') = '' AND data->>'anatema' IS NOT NULL;

UPDATE public.gods
SET weapons = COALESCE(NULLIF(weapons, ''), data->>'weapons', '')
WHERE COALESCE(weapons, '') = '' AND data->>'weapons' IS NOT NULL;

UPDATE public.gods
SET short_description = COALESCE(NULLIF(short_description, ''), data->>'shortDescription', '')
WHERE COALESCE(short_description, '') = '' AND data->>'shortDescription' IS NOT NULL;

-- 2) Preenche image_url a partir do JSONB onde a coluna está vazia
UPDATE public.gods
SET image_url = data->>'imageUrl'
WHERE COALESCE(image_url, '') = ''
  AND COALESCE(data->>'imageUrl', '') <> '';

-- 3) Converte qualquer URL (Supabase ou absoluta) para caminho relativo.
--    Mantém só o nome do arquivo e prefixa com a subpasta "gods/".
UPDATE public.gods
SET image_url = 'gods/' || regexp_replace(image_url, '^.*/', '')
WHERE COALESCE(image_url, '') <> ''
  AND image_url NOT LIKE 'gods/%';

COMMIT;
