# Validação

## Teste de integração real

Com Docker disponível e `.env` configurado:

```bash
docker compose --env-file .env -f infra/docker-compose.yml up --build -d
docker compose --env-file .env -f infra/docker-compose.yml --profile tests run --rm integration-tests
```

O teste acessa o API Gateway, cria usuário, inicia sessão JWT, consulta perfil/cidade/detalhe, testa autorização e unicidade de favorito, grava/compara comentário com nome de autor consultado no Identity e registra uma sugestão. Cria dados efêmeros e tenta limpá-los ao terminar. Os bancos precisam ter sido inicializados pelo Compose.

Verificações estáticas e configuração:

```bash
npm run build
cd backend && npx prisma validate --schema prisma/auth.schema
cd backend && npx prisma validate --schema prisma/core.schema
docker compose --env-file .env -f infra/docker-compose.yml config
```

`GET http://localhost:5000/health` deve retornar `200` e `status: ok` quando gateway e os dois serviços estão saudáveis.

## Resultado observado (27/10/2026)

- `npm run build`: compilou o portal e passou a verificação de tipos; o resumo Next listou todas as rotas API como dinâmicas.
- `prisma validate`: os schemas `auth.schema` e `core.schema` foram validados.
- `docker compose up --build -d`: imagens construídas; os dois bancos, serviços, gateway e portal iniciaram com health checks saudáveis.
- Teste `integration-tests`: passou via gateway em cadastro/login/JWT, perfil, leitura de cidade UUID e criador resolvido no Identity, ponto turístico, autorização e unicidade de favorito, comentário com autor entre serviços e sugestão persistida.
- Chamada local ao Next `GET /api/cidades`: `200 []`; gateway `GET /health`: `200`, Identity e Destinations saudáveis.
- O backend foi instalado em imagem limpa pelo lockfile npm sem dependência Supabase; clientes Prisma gerados e migrations SQL carregados nos bancos novos.
- Configuração do Compose para bancos locais e Compose com PostgreSQL gerenciado foi analisada. Nenhuma implantação AWS/Azure foi realizada.

## Limites

O teste de integração comprova as rotas principais e gravação em PostgreSQL local. Não executa carga k6, não valida concorrência em escala, backups, failover, custo real nem latência entre nuvens. Não houve provisionamento ou deploy AWS/Azure. A implantação deve validar credenciais, firewall, TLS, migração de dados e billing no ambiente escolhido.
