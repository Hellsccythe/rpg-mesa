-- 101 — deuses, mapas, NPCs, raças e passados pertencem a um mundo
--
-- Fase 2 de docs/MUNDOS.md. Os catálogos de AMBIENTAÇÃO ganham
-- campaign_id; os de REGRA (classes, skills, títulos, perícias, economia)
-- continuam globais — se referenciam por nome, e são o RPG em si.
--
-- Tudo que existe vai para a campanha padrão, resolvida pelo slug (o id
-- não é garantido). Ela também é renomeada: o nome "Caminho Sem Volta" é
-- o do sistema; o mundo se chama Elyra — "Mundo 2 — Elyra".
--
-- Índices únicos que eram por servidor viram por mundo:
--   gods.name e city_maps.name eram UNIQUE totais (uma linha soft-deletada
--   segurava o nome para sempre). Viram (campaign_id, name) parciais: dois
--   mundos podem ter uma Pharasma, e apagar um deus libera o nome.
--   classe_secreta_revelada.classe_id era UNIQUE total: a exclusividade da
--   classe secreta valia para o servidor inteiro. Vira (campaign_id,
--   classe_id): um Lich por mesa. A coluna campaign_id vem do personagem
--   que a detém.
--   characters.username era único global. Vira (campaign_id, username):
--   a mesma conta pode ter um personagem em cada mundo.
--
-- usuarios.limite_personagens_por_mundo: quantos personagens vivos a conta
-- pode ter no mesmo mundo. O mestre decide no pré-registro; padrão 1.

BEGIN;

UPDATE campaigns SET name = 'Elyra' WHERE slug = 'caminho-sem-volta' AND name = 'Caminho Sem Volta';

-- ── campaign_id nos cinco catálogos de mundo ────────────────────────────────

ALTER TABLE gods      ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
ALTER TABLE city_maps ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
ALTER TABLE npcs      ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
ALTER TABLE racas     ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
ALTER TABLE passados  ADD COLUMN IF NOT EXISTS campaign_id INTEGER;

UPDATE gods      SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' AND deleted_at IS NULL) WHERE campaign_id IS NULL;
UPDATE city_maps SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' AND deleted_at IS NULL) WHERE campaign_id IS NULL;
UPDATE npcs      SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' AND deleted_at IS NULL) WHERE campaign_id IS NULL;
UPDATE racas     SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' AND deleted_at IS NULL) WHERE campaign_id IS NULL;
UPDATE passados  SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' AND deleted_at IS NULL) WHERE campaign_id IS NULL;

ALTER TABLE gods      ALTER COLUMN campaign_id SET NOT NULL;
ALTER TABLE city_maps ALTER COLUMN campaign_id SET NOT NULL;
ALTER TABLE npcs      ALTER COLUMN campaign_id SET NOT NULL;
ALTER TABLE racas     ALTER COLUMN campaign_id SET NOT NULL;
ALTER TABLE passados  ALTER COLUMN campaign_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gods_campanha      ON gods (campaign_id);
CREATE INDEX IF NOT EXISTS idx_city_maps_campanha ON city_maps (campaign_id);
CREATE INDEX IF NOT EXISTS idx_npcs_campanha      ON npcs (campaign_id);
CREATE INDEX IF NOT EXISTS idx_racas_campanha     ON racas (campaign_id);
CREATE INDEX IF NOT EXISTS idx_passados_campanha  ON passados (campaign_id);

-- ── nomes únicos por mundo, e só entre os vivos ─────────────────────────────

ALTER TABLE gods DROP CONSTRAINT IF EXISTS gods_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_gods_nome_por_mundo
  ON gods (campaign_id, name) WHERE deleted_at IS NULL;

ALTER TABLE city_maps DROP CONSTRAINT IF EXISTS city_maps_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_city_maps_nome_por_mundo
  ON city_maps (campaign_id, name) WHERE deleted_at IS NULL;

-- ── classe secreta: um titular por mundo ────────────────────────────────────

ALTER TABLE classe_secreta_revelada ADD COLUMN IF NOT EXISTS campaign_id INTEGER;

UPDATE classe_secreta_revelada revelada
SET campaign_id = characters.campaign_id
FROM characters
WHERE characters.id = revelada.character_id AND revelada.campaign_id IS NULL;

-- Personagem sem mundo (não deveria existir) cai na campanha padrão, para o NOT NULL passar.
UPDATE classe_secreta_revelada
SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' AND deleted_at IS NULL)
WHERE campaign_id IS NULL;

ALTER TABLE classe_secreta_revelada ALTER COLUMN campaign_id SET NOT NULL;
ALTER TABLE classe_secreta_revelada DROP CONSTRAINT IF EXISTS classe_secreta_revelada_classe_id_key;
ALTER TABLE classe_secreta_revelada
  ADD CONSTRAINT classe_secreta_revelada_mundo_classe_key UNIQUE (campaign_id, classe_id);

-- ── um personagem por mundo por conta ───────────────────────────────────────

DROP INDEX IF EXISTS idx_characters_username;
CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_username_por_mundo
  ON characters (campaign_id, username) WHERE deleted_at IS NULL;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS limite_personagens_por_mundo INTEGER NOT NULL DEFAULT 1;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_limite_personagens_check;
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_limite_personagens_check CHECK (limite_personagens_por_mundo >= 1);

COMMIT;
