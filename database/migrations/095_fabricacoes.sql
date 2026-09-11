-- 095 — o log da ação de fabricar, e as margens da escada de qualidade
--
-- Cada tentativa de fabricar fica gravada: é o que permite ao mestre ver quem
-- fabricou o quê e quando, e ao jogador provar que a obra-prima foi dele.
-- Sem soft delete: é histórico, não cadastro — e sem `updated_at`, porque uma
-- tentativa nunca muda depois de feita.
--
-- O desenho inteiro está em docs/FABRICAR.pdf. A escada tem quatro saídas
-- decididas pela distância entre a rolagem (d20 + bônus da perícia) e a DC:
-- desastre a DC−10, mal feito abaixo da DC, bem feito na DC, obra-prima a
-- DC+15. Assimétrica de propósito — com ±10 nos dois lados, rank 1 tirava
-- obra-prima em 30% das poções Comuns.

CREATE TABLE IF NOT EXISTS fabricacoes (
  id            INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  character_id  INTEGER     NOT NULL,
  receita_id    INTEGER     NOT NULL,
  rolagem_d20   INTEGER     NOT NULL,
  bonus         INTEGER     NOT NULL,
  dificuldade   INTEGER     NOT NULL,
  resultado     VARCHAR(12) NOT NULL,
  -- Verdadeiro quando a receita exigia ferramenta fixa e quem apertou o
  -- botão confirmou que ela estava no lugar. Fica gravado porque é a única
  -- parte da checagem que é palavra, não dado.
  oficina_confirmada BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    TEXT,
  CONSTRAINT fabricacoes_rolagem_check   CHECK (rolagem_d20 BETWEEN 1 AND 20),
  CONSTRAINT fabricacoes_resultado_check CHECK (resultado IN ('desastre', 'malfeito', 'bemfeito', 'obra_prima'))
);

CREATE INDEX IF NOT EXISTS idx_fabricacoes_personagem ON fabricacoes (character_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fabricacoes_receita    ON fabricacoes (receita_id);

-- ── As margens, como regra consultável ────────────────────────────────────
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('fabricar.margem_desastre', '10',
   'Rolagem a esta distância ABAIXO da DC ou mais é desastre: nada é produzido e os insumos se perdem. A ferramenta não.'),
  ('fabricar.margem_obra_prima', '15',
   'Rolagem a esta distância ACIMA da DC ou mais é obra-prima: o item sai com o extra da categoria. Maior que a de desastre de propósito — brilhar é mais difícil que fracassar feio.'),
  ('fabricar.rank_minimo', '1',
   'Rank 0 na perícia não pode tentar. Sem isso, quem tem Inteligência alta fabrica poções sem nunca ter estudado alquimia.'),
  ('fabricar.ferramenta_fixa', 'oficina_disponivel',
   'Ferramenta acima de 12 kg é fixa e não se carrega: a ação exige que quem aperta o botão confirme que há uma oficina no lugar. Portátil precisa estar no inventário.'),
  ('fabricar.qualidade.pocao', 'turva=aplica Saturação; límpida=não aplica',
   'Poção mal feita (turva) aplica 1 acúmulo de Saturação Alquímica mesmo sem ser de cura. Obra-prima (límpida) NÃO aplica, mesmo sendo — a segunda resposta à saturação, depois da comida.'),
  ('fabricar.qualidade.veneno', 'diluído=DC-5; concentrado=DC+5',
   'Veneno mal feito: Fortitude DC −5 para resistir. Obra-prima: DC +5.'),
  ('fabricar.qualidade.alimento', 'malfeito=1d4; obra-prima=+1 porção',
   'Prato mal feito cura 1d4 fixo e sem efeito social. Obra-prima alimenta mais um.'),
  ('fabricar.qualidade.roupa', 'malfeita=bônus 0; obra-prima=bônus +1',
   'Roupa mal feita não impressiona ninguém. Obra-prima soma +1 ao bônus social do tecido.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

DO $$
BEGIN
  RAISE NOTICE 'fabricacoes criada; regras da escada gravadas: %',
    (SELECT count(*) FROM regras_do_sistema WHERE chave LIKE 'fabricar.%');
END $$;
