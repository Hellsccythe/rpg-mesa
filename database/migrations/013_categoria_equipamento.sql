-- Migration 013: Refatorar categoria_equipamento em equipamentos
-- Cria tabela de categorias, troca coluna VARCHAR por INTEGER[] na tabela equipamentos

-- 1. Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categoria_equipamento (
  item    INTEGER PRIMARY KEY,
  descricao VARCHAR(100) NOT NULL
);

-- 2. Seed das categorias iniciais
INSERT INTO categoria_equipamento (item, descricao) VALUES
  (1, 'Armadura'),
  (2, 'Exploração'),
  (3, 'Cura'),
  (4, 'Cosmético'),
  (5, 'Utilitário'),
  (6, 'Armas')
ON CONFLICT (item) DO NOTHING;

-- 3. Remover índice antigo baseado em VARCHAR
DROP INDEX IF EXISTS equipamentos_categoria_idx;

-- 4. Remover coluna antiga
ALTER TABLE equipamentos DROP COLUMN IF EXISTS categoria_equipamento;

-- 5. Adicionar nova coluna como array de inteiros
ALTER TABLE equipamentos
  ADD COLUMN IF NOT EXISTS categoria_equipamento_item INTEGER[] NOT NULL DEFAULT '{}';

-- 6. Criar índice GIN para buscas eficientes no array
CREATE INDEX IF NOT EXISTS equipamentos_categoria_item_idx
  ON equipamentos USING GIN (categoria_equipamento_item);
