# Comparação de provedores

O código está preparado para PostgreSQL local, AWS RDS for PostgreSQL e Azure Database for PostgreSQL Flexible Server. A configuração por provedor fica nos exemplos `.env.aws.example` e `.env.azure.example`, com a composição sem banco local em [`infra/docker-compose.managed.yml`](../../infra/docker-compose.managed.yml).

Para preços atuais, condições Free Tier, classes de serviço e elasticidade, consulte [`docs/infrastructure/README.md`](../infrastructure/README.md). GCP/multi-cloud não foi implementado porque não é requisito do diagrama submetido e não há fluxo Analytics/event bus no código atual. Nenhum recurso cloud foi criado.
