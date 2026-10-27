# API pública

Todas as rotas abaixo são publicadas pelo Next.js em `/api` e encaminhadas pelo API Gateway. Requisições protegidas usam `Authorization: Bearer <token>`.

## Identidade

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro `{nomeCompleto,email,senha}`; senha mínima de 8 caracteres |
| POST | `/api/auth/login` | Login `{email,senha}`; retorna `{token,user}` |
| GET | `/api/auth/me` | Perfil do token |
| PUT | `/api/auth/update/:id` | Atualiza perfil próprio ou solicita função colaborador |

Senha é derivada com `scrypt` e salt aleatório. O JWT assinado com HS256 expira em sete dias. O projeto não oferece confirmação de email nem recuperação de senha.

## Destinos e negócio

| Método | Rota | Token | Descrição |
|---|---|---:|---|
| GET | `/api/cidades` | Não | Lista cidades e estado |
| GET | `/api/cidades/buscar?nome=` | Não | Busca sem diferenciar maiúsculas |
| GET | `/api/cidades/:id` | Não | Detalhe de uma cidade |
| GET | `/api/pontos/:cidadeId` | Não | Pontos turísticos |
| GET | `/api/como-chegar/:cidadeId` | Não | Meios de chegada |
| GET | `/api/atividades/:cidadeId` | Não | Atividades |
| GET | `/api/dicas/:cidadeId` | Não | Dicas |
| GET | `/api/comentarios/por-cidade/:cidadeId` | Não | Lista e enriquece autor via serviço Identity |
| POST | `/api/comentarios` | Sim | Cria comentário do usuário autenticado |
| PUT/DELETE | `/api/comentarios/:id` | Sim | Atualiza/exclui comentário próprio ou admin |
| GET | `/api/favoritos/:userID` | Sim | Lista favoritos próprios |
| POST | `/api/favoritos/add` | Sim | Adiciona `{userID,cidadeID}`; duplicata retorna 409 |
| DELETE | `/api/favoritos/remove` | Sim | Remove `{userID,cidadeID}` |
| POST | `/api/sugerir` | Sim | Envia sugestão com estado, cidade, coordenadas e conteúdo opcional |

Para carregar cidades, aplique primeiro o esquema core. `infra/db/core.sql` inclui os nove estados do Nordeste. A API não disponibiliza cadastro administrativo de cidades; elas são provisionadas por migração/SQL.
