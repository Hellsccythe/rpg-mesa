-- Adiciona coluna de requisitos às classes híbridas
-- Formato: [{"name": "Guerreiro", "minLevel": 10}, {"name": "Ladrao", "minLevel": 10}]
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS requirements jsonb NULL;

COMMENT ON COLUMN public.classes.requirements IS
  'Array de requisitos para desbloquear a classe. Ex: [{"name":"Guerreiro","minLevel":10}]';
