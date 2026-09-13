-- 099 — livro pertence a um mundo e é liberado para uma lista de personagens
--
-- O site vai mestrar mais de um mundo (docs/MUNDOS.md), e o livro é o
-- primeiro catálogo a ganhar campanha. E o mestre quer liberar um livro para
-- um OU MAIS personagens — e tirar o acesso depois. A coluna character_id
-- (um só, nulo = todos) não cabe nisso.
--
--   campaign_id       o mundo do livro. Tudo que existe hoje vai para a
--                     campanha padrão, resolvida pelo slug (o id não é
--                     garantido — a 058 inseriu por slug)
--   visibilidade      'todos'      — todo personagem do mundo vê
--                     'escolhidos' — só quem está em lore_note_acesso
--                     'ninguem'    — rascunho: ninguém vê ainda
--   lore_note_acesso  a lista: (lore_note_id, character_id). UNIQUE total e
--                     sem soft delete, como npc_acesso_player — uma linha
--                     apagada de mentira travaria reconceder o acesso
--   formato           ganha 'bilhete' e 'carta': folha única como o
--                     pergaminho, só muda a cara do papel
--
-- A conversão: character_id nulo vira 'todos'; preenchido vira 'escolhidos'
-- com uma linha de acesso. Depois a coluna sai.

BEGIN;

ALTER TABLE lore_notes
  ADD COLUMN IF NOT EXISTS campaign_id INTEGER,
  ADD COLUMN IF NOT EXISTS visibilidade TEXT NOT NULL DEFAULT 'todos';

UPDATE lore_notes
SET campaign_id = (SELECT id FROM campaigns WHERE slug = 'caminho-sem-volta' AND deleted_at IS NULL)
WHERE campaign_id IS NULL;

ALTER TABLE lore_notes ALTER COLUMN campaign_id SET NOT NULL;

ALTER TABLE lore_notes DROP CONSTRAINT IF EXISTS lore_notes_visibilidade_check;
ALTER TABLE lore_notes
  ADD CONSTRAINT lore_notes_visibilidade_check CHECK (visibilidade IN ('todos', 'escolhidos', 'ninguem'));

ALTER TABLE lore_notes DROP CONSTRAINT IF EXISTS lore_notes_formato_check;
ALTER TABLE lore_notes
  ADD CONSTRAINT lore_notes_formato_check CHECK (formato IN ('livro', 'pergaminho', 'bilhete', 'carta'));

CREATE TABLE IF NOT EXISTS lore_note_acesso (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lore_note_id  INTEGER NOT NULL,
  character_id  INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    TEXT,
  updated_by    TEXT,
  CONSTRAINT lore_note_acesso_livro_personagem_key UNIQUE (lore_note_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_lore_note_acesso_personagem ON lore_note_acesso (character_id);
CREATE INDEX IF NOT EXISTS idx_lore_notes_campanha ON lore_notes (campaign_id);

-- Quem era exclusivo de um personagem continua exclusivo dele.
INSERT INTO lore_note_acesso (lore_note_id, character_id, created_by, updated_by)
SELECT id, character_id, 'migration-099', 'migration-099'
FROM lore_notes
WHERE character_id IS NOT NULL
ON CONFLICT DO NOTHING;

UPDATE lore_notes SET visibilidade = 'escolhidos' WHERE character_id IS NOT NULL;

ALTER TABLE lore_notes DROP COLUMN IF EXISTS character_id;

COMMIT;
