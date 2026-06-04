-- Migration 043: Status do personagem (vivo | morto)
-- Quando o personagem morre, libera automaticamente qualquer classe secreta que ele detinha

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'vivo'
    CHECK (status IN ('vivo', 'morto'));
