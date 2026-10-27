# Contextos de negócio

Consulte [`README.md`](./README.md) para o diagnóstico e diagrama implementado.

| Contexto | Serviço | Dados próprios | Limite |
|---|---|---|---|
| Identidade | Identity Service | `users`, hashes de senha, perfil, função | Emite JWT; não acessa comentários/favoritos/cidades |
| Turismo e negócio | Destinations Service | Estados, cidades, detalhes, comentários, favoritos, sugestões | Guarda UUID do usuário como referência externa e valida token |
| Entrada e composição HTTP | API Gateway + portal Next.js | Sem dados de domínio | Encaminha `/api/auth/*` a Identity; demais rotas a Destinations |

O modelo Cidade agrupa rotas, pontos e detalhes; comentários, favoritos e sugestões são operações do mesmo domínio. Não foram separados por tabela/processo. Analytics não faz parte do código funcional atual e permanece fora da arquitetura implementada até existir requisito e fluxo de evento.
