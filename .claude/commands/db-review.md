Você é um especialista em PostgreSQL e Supabase. Analise o banco de dados do projeto RPG de Mesa e retorne um relatório completo seguindo esses passos:

## 1. Mapeamento

- Liste todas as tabelas existentes
- Mostre as colunas, tipos e constraints de cada uma
- Identifique os relacionamentos entre tabelas

## 2. Índices

- Verifique índices existentes
- Identifique foreign keys sem índice
- Sugira novos índices baseado nas entidades (personagens, campanhas, deuses, mapas, cidades)

## 3. Schema

- Verifique se todas as tabelas têm `created_at`, `updated_at` e `deleted_at` (soft delete)
- Identifique colunas que deveriam ter constraints (NOT NULL, UNIQUE, etc.)
- Sugira melhorias de tipagem (ex: usar UUID ao invés de INT onde aplicável)

## 4. Segurança

- Verifique quais tabelas têm RLS (Row Level Security) ativo
- Aponte tabelas sensíveis sem RLS
- Sugira policies de RLS para o contexto de Mestre/Jogador

## 5. Performance

- Identifique tabela
