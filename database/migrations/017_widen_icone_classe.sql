-- Migration 017
-- Aumenta o tamanho da coluna 'icone' em classe_equipamento
-- de VARCHAR(10) para VARCHAR(60) para suportar nomes de ícones MDI
-- (ex: 'mdi-sword-cross' tem 15 chars; limite seguro é 60)

BEGIN;

ALTER TABLE public.classe_equipamento
  ALTER COLUMN icone TYPE VARCHAR(60);

COMMIT;
