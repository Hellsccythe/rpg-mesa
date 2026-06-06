-- Migration 049: multiplicador_atributo → TEXT[] (permite múltiplos atributos como multiplicador)
ALTER TABLE skills
  ALTER COLUMN multiplicador_atributo TYPE TEXT[]
    USING CASE WHEN multiplicador_atributo IS NULL THEN NULL::TEXT[] ELSE ARRAY[multiplicador_atributo] END;

ALTER TABLE skill_character_override
  ALTER COLUMN multiplicador_override TYPE TEXT[]
    USING CASE WHEN multiplicador_override IS NULL THEN NULL::TEXT[] ELSE ARRAY[multiplicador_override] END;
