-- 098 — nota de lore tem formato, capa e contracapa
--
-- O leitor de notas virou um livro de verdade (capa que abre, folha que vira
-- pela quina), e nem toda nota é um livro: um bilhete achado numa masmorra é
-- uma folha só. E o mestre quer dar cara própria a cada livro.
--
--   formato        'livro' (padrão) ou 'pergaminho' — o pergaminho é uma
--                  folha única, sem capa e sem virada
--   capa_url       imagem da capa, caminho relativo em uploads/lore/. Nula,
--                  o leitor desenha a capa padrão (moldura e dados dourados)
--   contracapa_url imagem da contracapa. Nula, repete a capa — sem o título
--
-- Caminho relativo, como toda imagem do projeto; a URL pública é montada na
-- resposta.

BEGIN;

ALTER TABLE lore_notes
  ADD COLUMN IF NOT EXISTS formato TEXT NOT NULL DEFAULT 'livro',
  ADD COLUMN IF NOT EXISTS capa_url TEXT,
  ADD COLUMN IF NOT EXISTS contracapa_url TEXT;

ALTER TABLE lore_notes DROP CONSTRAINT IF EXISTS lore_notes_formato_check;
ALTER TABLE lore_notes
  ADD CONSTRAINT lore_notes_formato_check CHECK (formato IN ('livro', 'pergaminho'));

COMMIT;
