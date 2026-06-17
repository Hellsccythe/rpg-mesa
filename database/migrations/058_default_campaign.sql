-- Migration 058: Campanha padrão e migração de personagens existentes
-- Cria "Caminho Sem Volta" como campanha padrão e associa todos os
-- personagens que ainda não têm campaign_id.

INSERT INTO campaigns (slug, name, description, is_active, created_by)
VALUES (
  'caminho-sem-volta',
  'Caminho Sem Volta',
  'A campanha original.',
  TRUE,
  'migration'
)
ON CONFLICT (slug) DO NOTHING;

-- Associa personagens sem campaign_id à campanha padrão
UPDATE characters
SET campaign_id = (
  SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' LIMIT 1
)
WHERE campaign_id IS NULL
  AND deleted_at IS NULL;
