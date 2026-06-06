-- Migration 047: remover effect_value; damage_base NUMERIC → TEXT (notação de dado); damage_display → multiplicador_atributo
ALTER TABLE skills DROP COLUMN IF EXISTS effect_value;

ALTER TABLE skills
  ALTER COLUMN damage_base TYPE TEXT
    USING CASE WHEN damage_base IS NULL THEN NULL ELSE damage_base::TEXT END;

ALTER TABLE skills RENAME COLUMN damage_display TO multiplicador_atributo;
