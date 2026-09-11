-- 086 — curva de XP por nível de classe
--
-- `class_level_progression` estava VAZIA, e isso tornava impossível subir
-- nível de classe por XP: `atribuirXpDeClasse` consulta a tabela para saber
-- quanto custa o próximo nível, não acha nada, e o laço nunca avança. O XP
-- entrava e o nível ficava parado, sem erro nenhum.
--
-- Só apareceu agora porque os marcos de Virtude (migration 085) dependem de o
-- nível de classe subir — o crédito estava implementado e era código morto.
--
-- A curva abaixo é um PONTO DE PARTIDA, não uma decisão fechada: 120 × nível,
-- espelhando a progressão de personagem, que cobra 120 para sair do nível 1.
-- Chegar ao nível 20 de uma classe custa 25.080 de XP acumulado. Ajuste à
-- vontade — a tabela é editável em /master/progressao.
--
-- Vale para as 29 classes por igual. Se alguma precisar de curva própria (uma
-- classe difícil de dominar, por exemplo), é editar as linhas dela.

INSERT INTO class_level_progression (classe_id, nivel, xp_necessario)
SELECT c.id, n.nivel, 120 * n.nivel
  FROM classes c
  CROSS JOIN generate_series(2, 20) AS n(nivel)
 WHERE c.deleted_at IS NULL
ON CONFLICT (classe_id, nivel) DO NOTHING;

DO $$
DECLARE
  classes_cobertas INTEGER;
  acumulado        INTEGER;
BEGIN
  SELECT count(DISTINCT classe_id) INTO classes_cobertas FROM class_level_progression;
  SELECT sum(xp_necessario) INTO acumulado
    FROM class_level_progression
   WHERE classe_id = (SELECT min(classe_id) FROM class_level_progression);

  RAISE NOTICE 'classes com curva: %  |  XP acumulado ate o nivel 20: %',
    classes_cobertas, acumulado;

  IF classes_cobertas < (SELECT count(*) FROM classes WHERE deleted_at IS NULL) THEN
    RAISE WARNING 'alguma classe ficou sem curva de XP';
  END IF;
END $$;
