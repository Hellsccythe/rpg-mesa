BEGIN;

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS username text NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_username
  ON public.characters (username)
  WHERE deleted_at IS NULL;

COMMIT;
