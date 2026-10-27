# Infraestrutura, bancos e implantação

## Banco e opções de nuvem

PostgreSQL é a opção de produção recomendada. É o mesmo mecanismo usado localmente, tem tipos nativos necessários (UUID, JSONB, timestamp com fuso), e Prisma gera os clientes para cada serviço. A mesma aplicação pode apontar para AWS ou Azure alterando apenas as URLs dos bancos. SQL Server/Azure SQL é relacional e gerenciado, mas não é compatível com as migrations/modelos PostgreSQL atuais sem adaptação do Prisma e reescrita de tipos e SQL.

| Opção | Compatibilidade | Custo e limites relevantes | Avaliação para o projeto |
|---|---|---|---|
| PostgreSQL local (Docker) | Total | Custo de nuvem zero; requer computador ligado e backups próprios | Recomendado para desenvolvimento, demonstração e avaliação acadêmica |
| AWS RDS for PostgreSQL | Alta; PostgreSQL gerenciado | Cobrança por instância-hora, armazenamento, I/O conforme classe, backup e tráfego. Plano AWS atual para novas contas é baseado em créditos; plano antigo pode ter 750 horas/mês micro, 20 GB de storage/backup por até 12 meses. Limites variam conforme data/conta. [RDS Free Tier](https://aws.amazon.com/rds/free/), [RDS pricing](https://aws.amazon.com/rds/postgresql/pricing/) | Melhor opção gerenciada para entrega que prioriza AWS, mas não afirmar gratuito sem conferir a conta e região |
| Amazon Aurora PostgreSQL | Alta, protocolo PostgreSQL; detalhes de extensão/engine precisam validação | Cobrança por capacidade, armazenamento e I/O; serverless pode escalar, porém custo mais difícil de prever. Créditos e limites do plano AWS atual aplicam. [Oferta AWS](https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-aurora-postgresql-aws-free-tier/) | Não recomendado para um protótipo pequeno; avalie somente quando autoescala/HA for objetivo do experimento |
| Azure Database for PostgreSQL Flexible Server | Alta; PostgreSQL gerenciado | Azure Free Account/Students lista 750 horas B1MS, 32 GB storage e 32 GB backup por 12 meses; excedentes e recursos após a oferta são cobrados. [Azure free services](https://azure.microsoft.com/en-us/free/students/), [pricing](https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/) | Alternativa comparável para laboratório Azure; validar elegibilidade e região antes de criar |
| Azure SQL Database | Baixa sem migração de engine | Modelo vCore ou DTU e opções serverless; preço depende da região, compute, storage e backup. [Pricing](https://azure.microsoft.com/en-us/pricing/details/azure-sql-database/single/) | Não escolhido: a portabilidade de engine custa mais do que o benefício para este projeto |
| MySQL gerenciado (RDS/Azure Database for MySQL) | Parcial; Prisma suporta MySQL, mas requer provider, migrations e adaptação JSON/DDL | Cobrança por compute, storage, backup e rede; AWS Free Tier novo/legado tem condições diferentes e Azure tem ofertas temporárias. [AWS RDS](https://aws.amazon.com/rds/free/), [Azure MySQL](https://azure.microsoft.com/en-us/pricing/details/mysql/flexible-server/) | Viável como comparação acadêmica, sem vantagem sobre manter a engine já compatível |

Como referência de cálculo, AWS publica EC2 t3.micro Linux em us-east-1 a US$ 0,0104/h (cerca de US$ 7,59 por 730 horas, antes de disco, IP, tráfego e impostos; outra região pode diferir). [Tabela T3](https://aws.amazon.com/ec2/instance-types/t3/). No Azure, compute PostgreSQL é cobrado pelo tier/SKU e tempo, e storage/backup ficam separados; a calculadora deve usar região, tier e tamanho reais. O servidor parado pode continuar cobrando armazenamento/backup em provedores gerenciados. Valores e ofertas mudam; estas referências foram consultadas em 26–27/10/2026. Use [AWS Pricing Calculator](https://calculator.aws/) e [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/) antes de provisionar.

### Decisão para a disciplina

Use o Compose/PostgreSQL sem custo de provedor na implementação e teste local. Para a etapa de cloud descrita nos materiais da disciplina, AWS EC2 + Compose é a implantação mais coerente e de menor trabalho adicional; PostgreSQL pode ser local no EC2 para demonstração curta ou RDS se o experimento exigir DB gerenciado e houver crédito/subsídio. Se escolher banco gerenciado para reduzir custo, hospede dois bancos (`rotas_auth`, `rotas_core`) no mesmo servidor PostgreSQL com usuários/credenciais separados; a separação lógica preserva ownership e evita pagar por duas instâncias, mas compartilha capacidade e domínio de falha. Azure Database for PostgreSQL fica preparado como alternativa de comparação, sem provisionamento obrigatório. Uma conta cloud requer monitorar billing e excluir recursos ao terminar; o código não cria nem exclui recursos cloud.

As ofertas Free Tier são condicionais, limitadas por conta/região/horas/armazenamento e podem converter-se em cobrança. Para projeto acadêmico sem verba confirmada, não se depende delas nem de instância paga permanente.

## Serviços de computação, armazenamento e elasticidade

| Classe | AWS (exemplos) | Azure (exemplos) | Uso no projeto |
|---|---|---|---|
| IaaS compute | EC2, Lightsail | Virtual Machines, Virtual Machine Scale Sets | Uma VM roda Compose para a entrega simples; Scale Sets/Auto Scaling adicionam VMs quando há carga |
| PaaS/containers | App Runner, ECS/Fargate | App Service, Container Apps | Hospedar portal e APIs sem administrar SO; Container Apps e ECS podem escalar réplicas |
| Relacional gerenciado | RDS PostgreSQL, Aurora PostgreSQL | PostgreSQL Flexible Server, Azure SQL Database | Preferir PostgreSQL nos dois lados; Azure SQL não é drop-in do schema atual |
| Bloco/objeto | EBS, S3 | Managed Disks, Blob Storage | Discos persistentes para VM/DB; objetos para imagens |
| Rede/entrada | Application Load Balancer, Route 53 | Azure Load Balancer, Azure Front Door | TLS, DNS e distribuição de tráfego até o Gateway |

### Como o custo é calculado e quando escolher

- AWS EC2: segundos/horas de instância conforme sistema/região e modelo (On-Demand, Savings Plans/Reserved, Spot), mais EBS, snapshots, IP público e saída de dados. EC2 serve ao exercício que exige controle da VM/Compose; App Runner/Fargate reduz operação de host para serviços sem estado. RDS soma horas da classe, GB-mês, backup, I/O/IOPS conforme configuração, transferência e HA.
- Azure VMs: compute por tamanho/região e tempo de execução, mais Managed Disks, IP e saída. App Service é mais direto para uma aplicação web; Container Apps é conveniente para serviços HTTP e escala por demanda. Flexible Server cobra SKU/tempo, storage, backup e HA.
- Exemplo didático: para a semana de avaliação, uma VM AWS pequena com Compose e PostgreSQL local minimiza setup e não paga por dois DB gerenciados. Se a equipe já tem crédito Azure e precisa mostrar PaaS, Container Apps + um Flexible Server PostgreSQL com duas databases é alternativa. A escolha deve ser baseada na conta/crédito disponível, região e estimativa da calculadora, não no rótulo “free tier”.
- Elasticidade simulada: manter os três serviços stateless (sem sessão local), colocar o Gateway atrás de um balanceador, configurar min 1/max 3 réplicas de Identity e Destinations com CPU alvo de 60% ou concorrência HTTP, e executar carga crescente (10→50→100 clientes) observando réplicas, latência e erros. PostgreSQL precisa limite de conexões/pool; escalar a API sem pool pode saturar DB. A configuração de autoscaling não está provisionada neste repositório.

O Compose serve para execução replicável e escala manual. Não equivale a autoscaling. Uma VM única pode rodar a arquitetura, mas não fornece alta disponibilidade; em ECS/Container Apps, configure réplicas e health checks. Banco e serviço não devem ser expostos diretamente à internet.

## Variáveis

Copie `.env.example` para `.env`. Campos requeridos pelo Compose: `AUTH_DB_PASSWORD`, `CORE_DB_PASSWORD`, `JWT_SECRET` (mínimo 32 caracteres) e `SERVICE_TOKEN`. Em hospedagem gerenciada, defina as URLs de conexão `AUTH_DATABASE_URL` e `CORE_DATABASE_URL` nos serviços respectivos. Senhas devem ser percent-encoded ao compor uma URL PostgreSQL. Não use o `.env.example` em nuvem.

`NEXT_PUBLIC_API_URL` é a origem pública do portal usada pelos componentes do browser (local: `http://localhost:3000`). `API_GATEWAY_URL` é endpoint interno do Next server (local: `http://localhost:5000`; Compose: `http://gateway:5000`). Não exponha `JWT_SECRET`, `SERVICE_TOKEN` ou URLs com credenciais ao navegador.

Os exemplos `.env.aws.example` e `.env.azure.example` mostram como fornecer URLs PostgreSQL gerenciadas. `infra/docker-compose.managed.yml` roda portal, gateway e serviços sem bancos locais; aplique `infra/db/auth.sql` e `infra/db/core.sql` nos bancos de destino antes de subir os containers. O mesmo PostgreSQL gerenciado pode conter os dois bancos com credenciais diferentes.

```bash
psql "$AUTH_DATABASE_URL" -f infra/db/auth.sql
psql "$CORE_DATABASE_URL" -f infra/db/core.sql
```

Para migração turística, carregue as tabelas do dump legado em um schema temporário no banco core (por exemplo, `legacy_import`), defina `search_path` para localizar essas tabelas e execute `scripts/migrations/001_legacy_core_data.sql`. Faça primeiro uma cópia/backup e compare contagens e IDs. A migração de credenciais de Identity não é coberta: hashes de senha precisam de compatibilidade comprovada ou os usuários devem redefinir senha.

## Execução com Docker Compose

```bash
cp .env.example .env
docker compose --env-file .env -f infra/docker-compose.yml up --build -d
docker compose --env-file .env -f infra/docker-compose.yml ps
curl http://localhost:5000/health
```

O Compose constrói o portal e os três processos Node (Gateway, Identity, Destinations), cria dois volumes/bancos PostgreSQL separados e espera health checks. Para parar: `docker compose --env-file .env -f infra/docker-compose.yml down`. Para remover bancos locais também, `down -v` apaga os dados locais.

## AWS e Azure

Deploy não executado. O arquivo Compose e os Dockerfiles são artefatos de implantação local/EC2; eles não criam redes, bancos gerenciados, DNS, certificados ou recursos em nuvem. Para AWS, provisionar uma VM Linux e executar Compose, ou criar tarefas ECS e RDS; para Azure, provisionar Container Apps/VMs e Flexible Server. Defina secrets no serviço correspondente e permita acesso PostgreSQL somente pela rede privada. As URLs devem apontar a instâncias separadas, uma por serviço. O mesmo artefato container pode ser usado nos dois provedores, sujeito à configuração de rede e secrets.
