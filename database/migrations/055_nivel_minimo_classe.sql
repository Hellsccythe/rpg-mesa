-- Migration 055: Adiciona nivel_minimo_classe em skills
-- Permite que o mestre defina o nível mínimo da classe para que a skill apareça como opção.
-- NULL = disponível desde o nível 1. Usado principalmente para skills assinatura e passivas avançadas.

ALTER TABLE skills ADD COLUMN IF NOT EXISTS nivel_minimo_classe INTEGER DEFAULT NULL;
