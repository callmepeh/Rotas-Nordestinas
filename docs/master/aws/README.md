# AWS

## Cenário compatível

- IaaS: EC2 com Compose para a entrega acadêmica de menor custo operacional.
- Containers gerenciados: ECS/Fargate ou App Runner para réplicas dos serviços.
- Relacional: RDS for PostgreSQL; opcionalmente um servidor com dois bancos lógicos e credenciais separadas para reduzir instâncias.
- Imagens: S3 (substituir o adaptador local por upload assinado).
- Entrada: Application Load Balancer, DNS e TLS.

As URLs e variáveis estão em [`.env.aws.example`](../../../.env.aws.example), e o Compose que usa PostgreSQL gerenciado está em [`infra/docker-compose.managed.yml`](../../../infra/docker-compose.managed.yml). Aplique [`infra/db/auth.sql`](../../../infra/db/auth.sql) e [`infra/db/core.sql`](../../../infra/db/core.sql) ao banco antes do deploy. Use redes privadas, Security Groups restritos, Parameter Store/Secrets Manager e alarmes de custo. Não abra PostgreSQL ou portas 3001/3002 publicamente.

O setup de infraestrutura não foi executado; não há instâncias, imagens de registry, RDS, DNS nem certificados provisionados. Veja a [comparação de custos e alternativas](../../infrastructure/README.md).
