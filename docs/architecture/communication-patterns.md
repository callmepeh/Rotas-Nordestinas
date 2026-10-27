# Comunicação entre processos

- Browser chama a origem do Next.js, preservando os endpoints existentes.
- Handlers Next encaminham método, path, query, corpo e cabeçalhos ao gateway por `API_GATEWAY_URL`.
- Gateway faz roteamento HTTP síncrono: `/api/auth/*` para Identity e as outras rotas para Destinations.
- Destinations valida JWT localmente. Para nomes de autores de comentários e criadores de cidade, chama `POST /internal/users/by-ids` no serviço Identity com `SERVICE_TOKEN`; timeout de 2 segundos mantém o conteúdo público disponível mesmo com falha de Identity.
- Não há broker/event bus implementado. Nenhum evento existente precisava ser processado em background e não há Analytics funcional no código atual.

O gateway agrega `/health` consultando os dois serviços. Responde `503 degraded` quando um deles está indisponível. Os serviços não publicam suas portas ao host no Compose.
