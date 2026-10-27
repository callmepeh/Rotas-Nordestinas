# Refatoração executada

O código anterior acessava Supabase diretamente pelos handlers Next e por controladores Express acoplados ao cliente Supabase. A refatoração removeu esses caminhos e dividiu a API em um gateway, Identity e Destinations/Business, mantendo as URLs consumidas pela interface.

1. API Gateway encaminha `/api/auth/*` a Identity e as outras rotas a Destinations.
2. Identity mantém credenciais e perfil em `rotas_auth`; senhas usam `scrypt`, JWT é assinado com `JWT_SECRET`.
3. Destinations mantém o catálogo e as operações de negócio em `rotas_core`.
4. UUIDs de usuário são referências externas; não há consultas cross-database nem FK entre contextos.
5. Handlers Next delegam via `lib/apiGatewayProxy.ts`; não acessam banco.

Banco atual e dados legados precisam de uma migração planejada. `scripts/migrations/001_legacy_core_data.sql` migra o domínio turístico; os perfis de usuários exigem reset de senha ou importação de hashes compatíveis, pois o serviço de Identity agora guarda hash próprio. Consulte [`README.md`](./README.md) e [infraestrutura](../infrastructure/README.md).
