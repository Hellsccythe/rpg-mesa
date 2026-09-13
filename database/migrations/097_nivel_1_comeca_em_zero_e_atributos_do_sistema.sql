-- 097 — a tabela de níveis começa em zero, e os bônus falam os atributos do sistema
--
-- Dois acertos de dado achados na varredura de setembro de 2026.
--
-- 1) level_progression estava deslocada em uma linha. A linha do nível 1
--    dizia "XP p/ subir 120" e "acumulado 120", como se houvesse um nível 0
--    que custasse 120 para virar 1. Mas personagem nasce nível 1 com 0 XP: o
--    serviço lê "nível N a partir de acumulado(N)", então o nível 2 só vinha
--    com 360, enquanto a tela prometia 120. Aqui o acumulado da linha N passa
--    a ser o acumulado da linha anterior (nível 1 = 0), e "XP p/ subir" vira
--    a diferença real até a próxima linha — que, nas linhas esparsas (5 → 10),
--    é o custo do marco inteiro, e não mais um número solto. O teto 100 cai
--    de 1.086.630 para 1.050.000. Decisão do mestre; o serviço não muda.
--
-- 2) classes.stat_bonuses e titles.bonuses usavam atributos de outro sistema
--    (carisma, constituicao, sabedoria — e um "resistência" com acento). Os
--    atributos deste projeto são aura, forca, destreza, resistencia,
--    inteligencia, como passados.atributo_bonus já usa. De-para do mestre:
--    carisma → aura, constituicao → resistencia, sabedoria → inteligencia.
--    Chaves que já existiam somam (uma classe com inteligencia 6 e sabedoria
--    2 fica com inteligencia 8). Chaves que não são atributo (resurrection,
--    undead_control, void_affinity, em títulos) ficam como estão.

BEGIN;

-- ── 1) level_progression ────────────────────────────────────────────────────

WITH ordenada AS (
  SELECT id,
         xp_total_accumulated AS acumulado_antigo,
         LAG(xp_total_accumulated, 1, 0) OVER (ORDER BY level) AS acumulado_novo
    FROM level_progression
)
UPDATE level_progression
   SET xp_total_accumulated = ordenada.acumulado_novo,
       xp_required_next     = ordenada.acumulado_antigo - ordenada.acumulado_novo,
       updated_at           = NOW()
  FROM ordenada
 WHERE level_progression.id = ordenada.id;

-- ── 2) atributos ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION pg_temp.traduzir_atributos(bonus JSONB) RETURNS JSONB AS $$
  SELECT COALESCE(
    (SELECT jsonb_object_agg(chave, total)
       FROM (
         SELECT CASE par.key
                  WHEN 'carisma'      THEN 'aura'
                  WHEN 'constituicao' THEN 'resistencia'
                  WHEN 'sabedoria'    THEN 'inteligencia'
                  WHEN 'resistência'  THEN 'resistencia'
                  ELSE par.key
                END AS chave,
                SUM(CASE WHEN jsonb_typeof(par.value) = 'number' THEN (par.value)::numeric ELSE 0 END) AS total
           FROM jsonb_each(bonus) AS par
          WHERE jsonb_typeof(par.value) = 'number'
          GROUP BY 1
       ) AS somado),
    '{}'::jsonb
  )
  || COALESCE(
    (SELECT jsonb_object_agg(par.key, par.value)
       FROM jsonb_each(bonus) AS par
      WHERE jsonb_typeof(par.value) <> 'number'),
    '{}'::jsonb
  );
$$ LANGUAGE sql IMMUTABLE;

UPDATE classes
   SET stat_bonuses = pg_temp.traduzir_atributos(stat_bonuses),
       updated_at   = NOW()
 WHERE deleted_at IS NULL
   AND stat_bonuses ?| ARRAY['carisma', 'constituicao', 'sabedoria', 'resistência'];

UPDATE titles
   SET bonuses    = pg_temp.traduzir_atributos(bonuses),
       updated_at = NOW()
 WHERE deleted_at IS NULL
   AND bonuses ?| ARRAY['carisma', 'constituicao', 'sabedoria', 'resistência'];

-- ── Conferência ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  nivel_um INTEGER;
  teto INTEGER;
  sobrou INTEGER;
BEGIN
  SELECT xp_total_accumulated INTO nivel_um FROM level_progression WHERE level = 1;
  SELECT xp_total_accumulated INTO teto FROM level_progression WHERE level = 100;
  SELECT COUNT(*) INTO sobrou
    FROM (SELECT stat_bonuses AS b FROM classes WHERE deleted_at IS NULL
          UNION ALL SELECT bonuses FROM titles WHERE deleted_at IS NULL) AS todos
   WHERE b ?| ARRAY['carisma', 'constituicao', 'sabedoria', 'resistência'];

  IF nivel_um <> 0 THEN RAISE EXCEPTION 'nível 1 deveria começar em 0, está em %', nivel_um; END IF;
  IF sobrou <> 0 THEN RAISE EXCEPTION 'ainda há % registros com atributo de outro sistema', sobrou; END IF;

  RAISE NOTICE '097: nível 1 = 0 XP, nível 100 = % XP; atributos traduzidos.', teto;
END $$;

COMMIT;
