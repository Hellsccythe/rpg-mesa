-- Migration 046: skill_tipo_dano_item, skill_categoria_item → INTEGER[]; raca_vinculada → TEXT[]
ALTER TABLE skills
  ALTER COLUMN skill_tipo_dano_item TYPE INTEGER[]
    USING CASE WHEN skill_tipo_dano_item IS NULL THEN NULL::INTEGER[] ELSE ARRAY[skill_tipo_dano_item] END,
  ALTER COLUMN skill_categoria_item TYPE INTEGER[]
    USING CASE WHEN skill_categoria_item IS NULL THEN NULL::INTEGER[] ELSE ARRAY[skill_categoria_item] END,
  ALTER COLUMN raca_vinculada TYPE TEXT[]
    USING CASE WHEN raca_vinculada IS NULL THEN NULL::TEXT[] ELSE ARRAY[raca_vinculada] END;
