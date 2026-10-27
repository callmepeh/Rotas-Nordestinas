-- Run on a PostgreSQL database that contains an export of the legacy schema
-- and the new core schema (infra/db/core.sql). User IDs remain opaque UUIDs;
-- the core service deliberately has no foreign keys into the identity database.
BEGIN;

INSERT INTO states (id, nome, sigla)
SELECT id, nome, sigla FROM estados
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, sigla = EXCLUDED.sigla;

INSERT INTO cities (id, nome_cidade, url_imagem, descricao, latitude, longitude, estado_id, criado_por, created_at, updated_at)
SELECT id, nomecidade, url_imagem, descricao, latitude, longitude, estadoid, userid,
       COALESCE(created_at, now()), COALESCE(updated_at, now())
FROM cidades
ON CONFLICT (id) DO NOTHING;

INSERT INTO tourist_points (id, cidade_id, titulo, descricao, url_imagem)
SELECT id, cidadeid, titulo, descricao, url_imagem FROM pontos_turisticos
ON CONFLICT (id) DO NOTHING;
INSERT INTO travel_options (id, cidade_id, tipo, titulo, descricao)
SELECT id, cidadeid, tipo, titulo, descricao FROM como_chegar
ON CONFLICT (id) DO NOTHING;
INSERT INTO activities (id, cidade_id, titulo, descricao, url_imagem)
SELECT id, cidadeid, titulo, descricao, url_imagem FROM atividades
ON CONFLICT (id) DO NOTHING;
INSERT INTO tips (id, cidade_id, titulo, descricao, url_imagem)
SELECT id, cidadeid, titulo, descricao, url_imagem FROM dicas
ON CONFLICT (id) DO NOTHING;
INSERT INTO comments (id, user_id, cidade_id, mensagem, created_at, updated_at)
SELECT id, userid, cidadeid, mensagem, COALESCE(created_at, now()), COALESCE(updated_at, now())
FROM comentarios
ON CONFLICT (id) DO NOTHING;
INSERT INTO favorites (id, user_id, cidade_id, created_at)
SELECT id, userid, cidadeid, COALESCE(created_at, now()) FROM favoritos
ON CONFLICT (id) DO NOTHING;
INSERT INTO route_suggestions (id, user_id, estado, nome_cidade, latitude, longitude, imagem_capa,
  descricao_cidade, como_chegar, pontos_turisticos, atividades, dicas, data_submissao, status,
  obs_admin, id_admin, cidade_id, created_at, updated_at)
SELECT id, userid, estado, nomecidade, latitude, longitude, imagemcapa, descricaocidade,
  COALESCE(NULLIF(comochegar, '')::jsonb, '[]'::jsonb),
  COALESCE(NULLIF(pontosturisticos, '')::jsonb, '[]'::jsonb),
  COALESCE(NULLIF(atividades, '')::jsonb, '[]'::jsonb),
  COALESCE(NULLIF(dicas, '')::jsonb, '[]'::jsonb),
  COALESCE(datasubmissao, now()),
  CASE WHEN status IN ('pendente','aprovado','rejeitado') THEN status ELSE 'pendente' END,
  COALESCE(obsadmin, ''), idadmin, cidadeid, COALESCE(created_at, now()), COALESCE(updated_at, now())
FROM sugestoes_de_rota
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('states','id'), GREATEST(COALESCE((SELECT max(id) FROM states),1),1));
SELECT setval(pg_get_serial_sequence('tourist_points','id'), GREATEST(COALESCE((SELECT max(id) FROM tourist_points),1),1));
SELECT setval(pg_get_serial_sequence('travel_options','id'), GREATEST(COALESCE((SELECT max(id) FROM travel_options),1),1));
SELECT setval(pg_get_serial_sequence('activities','id'), GREATEST(COALESCE((SELECT max(id) FROM activities),1),1));
SELECT setval(pg_get_serial_sequence('tips','id'), GREATEST(COALESCE((SELECT max(id) FROM tips),1),1));
SELECT setval(pg_get_serial_sequence('comments','id'), GREATEST(COALESCE((SELECT max(id) FROM comments),1),1));
SELECT setval(pg_get_serial_sequence('favorites','id'), GREATEST(COALESCE((SELECT max(id) FROM favorites),1),1));
SELECT setval(pg_get_serial_sequence('route_suggestions','id'), GREATEST(COALESCE((SELECT max(id) FROM route_suggestions),1),1));
COMMIT;
