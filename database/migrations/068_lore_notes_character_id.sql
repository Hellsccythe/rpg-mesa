-- 068 — devolve character_id a lore_notes, agora como INTEGER
--
-- A migration 010 criou a coluna como `uuid REFERENCES characters(id)`, para
-- permitir nota visível só a um personagem (NULL = nota global). Quando a
-- 022 converteu as PKs de UUID para INTEGER, a referência deixou de fazer
-- sentido e a coluna sumiu em algum ponto da conversão — mas o backend nunca
-- soube: o service continuou filtrando e gravando `character_id`.
--
-- Ou seja, TODAS as rotas de lore-notes estavam quebradas contra este
-- esquema. Não apareceu porque a tabela está vazia e a tela nunca foi
-- exercitada depois da conversão.
--
-- Sem FOREIGN KEY, seguindo a convenção do projeto: referências entre tabelas
-- são por convenção de inteiro.

BEGIN;

ALTER TABLE public.lore_notes
  ADD COLUMN IF NOT EXISTS character_id INTEGER;

COMMENT ON COLUMN public.lore_notes.character_id IS
  'NULL = nota global, visível a todos. Preenchido = visível só àquele personagem.';

CREATE INDEX IF NOT EXISTS idx_lore_notes_character
  ON public.lore_notes (character_id)
  WHERE deleted_at IS NULL;

COMMIT;
