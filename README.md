# 🌵 Rotas Nordestinas

Portal de turismo do Nordeste brasileiro. Mantém Next.js 15, React 19 e TypeScript na interface, agora integrado a serviços Express com persistência relacional independente.

## Funcionalidades

- Explorar cidades com mapas, descrição e imagens
- Pontos turísticos, meios de chegada, atividades e dicas
- Cadastro, login e perfil com JWT
- Comentários, favoritos e sugestões de rota

## Arquitetura implementada

O Next.js recebe o tráfego do browser e encaminha `/api/*` ao API Gateway Express. O gateway roteia autenticação e perfil para Identity Service e as demais rotas para Destinations/Business Service. Cada serviço usa seu próprio banco PostgreSQL. Os UUIDs de usuário são referências opacas no banco de destinos; não há FK cross-service. Veja [arquitetura](./docs/architecture/README.md).

## Rodar localmente

Requer Node.js 22+, npm e Docker Compose.

```bash
cp .env.example .env
docker compose --env-file .env -f infra/docker-compose.yml up --build -d
```

Portal em `http://localhost:3000`; estado dos serviços em `http://localhost:5000/health`. Configure segredos próprios em `.env`. `.env.example` contém apenas valores para desenvolvimento local.

Para executar o teste de integração contra os bancos e APIs locais:

```bash
docker compose --env-file .env -f infra/docker-compose.yml --profile tests run --rm integration-tests
```

## Persistência

- Esquemas SQL: [`infra/db/auth.sql`](./infra/db/auth.sql), [`infra/db/core.sql`](./infra/db/core.sql)
- Modelos Prisma e geração: [`backend/prisma`](./backend/prisma)
- Migração de dados do esquema legado: [`scripts/migrations/001_legacy_core_data.sql`](./scripts/migrations/001_legacy_core_data.sql)
- Opções PostgreSQL AWS/Azure, custos e configuração: [infraestrutura](./docs/infrastructure/README.md)

Senhas de contas legadas não são recuperáveis em texto claro via exportação SQL; planeje redefinição ou migração de hash compatível. Não houve implantação em nuvem.

## Critérios da disciplina

Os materiais da professora orientam arquitetura de microsserviços, uso de virtualização/containers, comparação de serviços e custos em provedores, e elasticidade. O comparativo e a escolha financeiramente viável estão documentados em [infraestrutura](./docs/infrastructure/README.md). A implantação prevista é configurável, mas deve ser executada e validada em conta AWS/Azure antes de ser considerada deploy real.
