-- 093 — só a Nobreza rola ouro
--
-- Fecha a pendência aberta na 092: com o ouro a cem prata, os quatro passados
-- não-nobres que rolavam 1d4 de ouro passam a rolar prata, e a Nobreza é a
-- única que continua com moeda de ouro no dado — que é o que "moeda de nobre"
-- tem de significar na ficha, e não só na regra.
--
-- Os dados são decisão do mestre e entram como vieram:
--
--   Nobreza      1d10 ouro + 4d10 prata   (o ouro subiu de 1d6; a prata de bolso fica)
--   Mercenário   4d100 prata
--   Aventureiro  3d100 prata
--   Guarda       4d100 prata
--   Varejista    5d100 prata
--
-- Andarilho (6d10) e Vítima (4d10) não rolavam ouro e não mudam.
--
-- Vale registrar o que isso faz com a distribuição, porque a 079 tinha
-- calibrado a amplitude em 2,6:1 e agora ela passa a ~26:1 — o Varejista, que
-- "tinha negócio, não tinha fortuna", começa com 252 prata em média (quatro
-- meses de salário de artesão), e a Nobreza com 572. Os preços do catálogo
-- foram ancorados na escala antiga; um Guarda hoje compra um Arcabuz (180) no
-- primeiro dia. Se isso for intenção, está certo; se não, é editar cinco
-- linhas aqui.

UPDATE passados SET dinheiro_inicial =
  '[{"quantidade": 1, "faces": 10, "moeda": "ouro"}, {"quantidade": 4, "faces": 10, "moeda": "prata"}]'::jsonb
 WHERE nome = 'Nobreza' AND deleted_at IS NULL;

UPDATE passados SET dinheiro_inicial = '[{"quantidade": 4, "faces": 100, "moeda": "prata"}]'::jsonb
 WHERE nome = 'Mercenário' AND deleted_at IS NULL;

UPDATE passados SET dinheiro_inicial = '[{"quantidade": 3, "faces": 100, "moeda": "prata"}]'::jsonb
 WHERE nome = 'Aventureiro' AND deleted_at IS NULL;

UPDATE passados SET dinheiro_inicial = '[{"quantidade": 4, "faces": 100, "moeda": "prata"}]'::jsonb
 WHERE nome = 'Guarda' AND deleted_at IS NULL;

UPDATE passados SET dinheiro_inicial = '[{"quantidade": 5, "faces": 100, "moeda": "prata"}]'::jsonb
 WHERE nome = 'Varejista' AND deleted_at IS NULL;

-- A regra deixa de ser pendência.
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('moeda.ouro_no_dinheiro_inicial', 'so_nobreza',
   'Só o passado Nobreza rola moeda de ouro no dinheiro inicial. Os outros rolam prata, mesmo quando ricos.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha       RECORD;
  com_ouro    INTEGER;
  media_min   NUMERIC;
  media_max   NUMERIC;
BEGIN
  SELECT count(*) INTO com_ouro
    FROM passados p, jsonb_array_elements(p.dinheiro_inicial) AS d
   WHERE p.deleted_at IS NULL AND d->>'moeda' = 'ouro';
  IF com_ouro <> 1 THEN
    RAISE EXCEPTION 'ABORTADO: esperava exatamente 1 dado de ouro (Nobreza), encontrei %', com_ouro;
  END IF;

  RAISE NOTICE 'dinheiro inicial em prata (1 ouro = 100), media por passado:';
  FOR linha IN
    SELECT p.nome,
           round(sum(
             (d->>'quantidade')::numeric * ((d->>'faces')::numeric + 1) / 2
             * CASE d->>'moeda' WHEN 'ouro' THEN 100 WHEN 'bronze' THEN 0.1 ELSE 1 END
           )) AS media
      FROM passados p, jsonb_array_elements(p.dinheiro_inicial) AS d
     WHERE p.deleted_at IS NULL
     GROUP BY p.nome ORDER BY media DESC
  LOOP
    RAISE NOTICE '  %: % prata', rpad(linha.nome, 12), linha.media;
  END LOOP;

  SELECT min(media), max(media) INTO media_min, media_max FROM (
    SELECT sum((d->>'quantidade')::numeric * ((d->>'faces')::numeric + 1) / 2
               * CASE d->>'moeda' WHEN 'ouro' THEN 100 WHEN 'bronze' THEN 0.1 ELSE 1 END) AS media
      FROM passados p, jsonb_array_elements(p.dinheiro_inicial) AS d
     WHERE p.deleted_at IS NULL GROUP BY p.nome) AS x;
  RAISE NOTICE 'amplitude entre o mais pobre e o mais rico: %:1 (era 2,6:1 na migration 079)',
    round(media_max / media_min, 1);
END $$;
