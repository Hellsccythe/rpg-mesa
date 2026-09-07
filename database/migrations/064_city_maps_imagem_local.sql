-- Migration 064: Aponta as imagens de city_maps para o armazenamento local
--
-- As URLs apontavam para o Supabase Storage, que vai sair do ar. Passam a
-- guardar o caminho relativo ("maps/hamlet.webp"); a URL completa é montada
-- em runtime a partir de PUBLIC_BASE_URL.
--
-- O nome do arquivo perde o prefixo de data que a versão antiga adicionava
-- ("1775782301016-hamlet.webp" vira "hamlet.webp"), seguindo a convenção
-- de nomes adotada no armazenamento novo.
--
-- Diferente de gods (migration 063), o JSONB "data" NÃO é desmontado aqui:
-- ele guarda pointsOfInterest, um array de objetos com coordenadas e links
-- entre mapas. Isso é dado legitimamente aninhado, não duplicação de coluna.
--
-- map_reference recebe o mesmo tratamento porque também guardava a URL da
-- imagem, apesar do nome sugerir outra coisa.

BEGIN;

-- imageUrl dentro do JSONB
UPDATE public.city_maps
SET data = jsonb_set(
      data,
      '{imageUrl}',
      to_jsonb('maps/' || regexp_replace(regexp_replace(data->>'imageUrl', '^.*/', ''), '^[0-9]{10,}-', ''))
    )
WHERE COALESCE(data->>'imageUrl', '') <> ''
  AND data->>'imageUrl' NOT LIKE 'maps/%';

-- map_reference, que também guardava a URL da imagem
UPDATE public.city_maps
SET map_reference = 'maps/' || regexp_replace(regexp_replace(map_reference, '^.*/', ''), '^[0-9]{10,}-', '')
WHERE map_reference LIKE 'http%'
  AND map_reference NOT LIKE 'maps/%';

COMMIT;
