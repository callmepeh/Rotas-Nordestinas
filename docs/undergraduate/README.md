# Requisitos da disciplina (TES)

O material da disciplina pede comparação entre dois provedores, classes de serviço, composição de custo, exemplo de escolha e simulação de elasticidade. A proposta para Rotas Nordestinas está consolidada em [`docs/infrastructure/README.md`](../infrastructure/README.md): AWS (EC2/ECS/RDS) e Azure (VMs/Container Apps/PostgreSQL Flexible Server), decisão compatível com orçamento acadêmico e cenário de escala.

O enunciado de implantação pede AWS EC2 sem Docker e com Docker em etapas distintas. O repositório prepara Docker Compose e execução Node por serviço, mas não executa nem declara deploy cloud. O diagrama real de serviços e a validação local estão em [`docs/architecture/README.md`](../architecture/README.md) e [`docs/testing/README.md`](../testing/README.md).

Para uma execução acadêmica de menor custo, a recomendação é uma VM EC2 de laboratório com Compose e PostgreSQL local. RDS é opcional se houver crédito; Azure Flexible Server serve como alternativa de comparação, sem exigir conta ou gasto cloud.
