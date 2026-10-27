# Microsoft Azure

## Cenário compatível

- IaaS: Linux Virtual Machines para executar Docker Compose.
- Containers gerenciados: Azure Container Apps para escalar Gateway, Identity e Destinations; App Service é alternativa para web/API.
- Relacional: Azure Database for PostgreSQL Flexible Server (recomendado por compatibilidade); Azure SQL Database exigiria migração de engine.
- Imagens: Blob Storage com SAS/upload assinado.
- Entrada: Azure Front Door ou Load Balancer, DNS e TLS.

As conexões estão em [`.env.azure.example`](../../../.env.azure.example); a configuração sem bancos locais está em [`infra/docker-compose.managed.yml`](../../../infra/docker-compose.managed.yml). Crie duas databases e usuários PostgreSQL separados ou servidores separados; aplique os SQL em `infra/db` e mantenha DB apenas em rede privada.

Não houve criação de recursos Azure. A conta gratuita estudantil/individual tem limites temporários e elegibilidade própria; veja os links e a comparação em [infraestrutura](../../infrastructure/README.md) antes de provisionar.
