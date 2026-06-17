-- Migration 059: Adiciona campaign_id em character_creation_requests
-- Permite que a solicitação de criação seja vinculada a uma campanha específica.
-- Ao aprovar, o personagem é criado com o campaign_id da solicitação.

ALTER TABLE character_creation_requests
  ADD COLUMN IF NOT EXISTS campaign_id UUID;
