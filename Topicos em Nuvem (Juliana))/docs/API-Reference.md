# ROTAS NORDESTINAS — Referência da API

**Versão:** 1.0.0  
**Data:** 04/09/2026  
**Ambiente:** Desenvolvimento (localhost)

---

## Sumário

| Serviço | URL Base | Porta |
|---------|----------|-------|
| Portal & Auth | `http://localhost:3000` | 3000 |
| Destinos Core | `http://localhost:3001` | 3001 |
| Analytics | `http://localhost:3002` | 3002 |

---

## 1. Portal & Auth Service

### Autenticação

#### POST `/api/auth/register`
Cadastra um novo usuário.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "nomeCompleto": "João Silva"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "nomeCompleto": "João Silva",
    "funcao": "usuario"
  },
  "token": "jwt-token-here"
}
```

---

#### POST `/api/auth/login`
Autentica um usuário existente.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "nomeCompleto": "João Silva",
    "funcao": "usuario"
  },
  "token": "jwt-token-here"
}
```

---

#### GET `/api/auth/me`
Retorna os dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "usuario@email.com",
  "nomeCompleto": "João Silva",
  "funcao": "usuario",
  "telefone": "(86) 99999-9999",
  "dataNascimento": "1990-01-15",
  "siglaEstado": "PI",
  "nomeCidade": "Teresina"
}
```

---

#### PUT `/api/auth/update/:id`
Atualiza o perfil do usuário.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "nomeCompleto": "João Silva Santos",
  "telefone": "(86) 98888-8888"
}
```

**Response (200):**
```json
{
  "message": "Perfil atualizado com sucesso",
  "user": { ... }
}
```

---

## 2. Destinos Core Service

### Cidades

#### GET `/api/cidades`
Lista todas as cidades do Nordeste.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nomeCidade": "Fortaleza",
    "url_imagem": "https://...",
    "descricao": "A Terrazinha...",
    "latitude": -3.7172,
    "longitude": -38.5433,
    "estados": {
      "id": 6,
      "nome": "Ceará",
      "sigla": "CE"
    }
  }
]
```

---

#### GET `/api/cidades/:id`
Busca uma cidade específica por ID.

**Response (200):**
```json
{
  "id": "uuid",
  "nomeCidade": "Fortaleza",
  "url_imagem": "https://...",
  "descricao": "Fortaleza é a capital do estado do Ceará...",
  "latitude": -3.7172,
  "longitude": -38.5433,
  "estados": {
    "id": 6,
    "nome": "Ceará",
    "sigla": "CE"
  },
  "pontosTuristicos": [...],
  "comoChegar": [...],
  "atividades": [...],
  "dicas": [...]
}
```

---

#### GET `/api/cidades/buscar?q=:termo`
Busca cidades por nome.

**Query Params:**
- `q` — Termo de busca

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nomeCidade": "Fortaleza",
    "url_imagem": "https://...",
    "descricao": "..."
  }
]
```

---

#### POST `/api/cidades`
Cria uma nova cidade. *(Requer autenticação: admin/colaborador)*

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "nomeCidade": "Parnaíba",
  "url_imagem": "https://...",
  "descricao": "Portal do Piauí...",
  "latitude": -2.9045,
  "longitude": -41.7767,
  "estadoID": 18
}
```

---

### Pontos Turísticos

#### GET `/api/pontos/:cidadeId`
Lista os pontos turísticos de uma cidade.

**Response (200):**
```json
[
  {
    "id": 1,
    "cidadeId": "uuid",
    "titulo": "Praia de Iracema",
    "descricao": "Uma das praias mais tradicionais...",
    "url_imagem": "https://..."
  }
]
```

---

### Como Chegar

#### GET `/api/como-chegar/:cidadeId`
Lista as opções de como chegar à cidade.

**Response (200):**
```json
[
  {
    "id": 1,
    "cidadeId": "uuid",
    "tipo": "Aéreo",
    "titulo": "Aeroporto Internacional Pinto Martins",
    "descricao": "Voos diretos de todas as capitais..."
  }
]
```

---

### Atividades

#### GET `/api/atividades/:cidadeId`
Lista as atividades disponíveis na cidade.

**Response (200):**
```json
[
  {
    "id": 1,
    "cidadeId": "uuid",
    "titulo": "Passeio de Jangada",
    "descricao": "Conheça as praias de barco tradicional...",
    "url_imagem": "https://..."
  }
]
```

---

### Dicas

#### GET `/api/dicas/:cidadeId`
Lista dicas para visitantes da cidade.

**Response (200):**
```json
[
  {
    "id": 1,
    "cidadeId": "uuid",
    "titulo": "Melhor época para visitar",
    "descricao": "Setembro a março tem temperaturas mais amenas...",
    "url_imagem": "https://..."
  }
]
```

---

### Comentários

#### GET `/api/comentarios/por-cidade/:cidadeId`
Lista os comentários de uma cidade.

**Response (200):**
```json
[
  {
    "id": 1,
    "mensagem": "Lugar incrível!",
    "created_at": "2026-09-04T14:30:00Z",
    "userID": "uuid",
    "usuario": {
      "nome": "João Silva"
    }
  }
]
```

---

#### POST `/api/comentarios`
Cria um novo comentário. *(Requer autenticação)*

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "cidadeId": "uuid-da-cidade",
  "mensagem": "Amei this lugar! Voltarei com certeza."
}
```

**Response (201):**
```json
{
  "id": 1,
  "mensagem": "Amei this lugar! Voltarei com certeza.",
  "created_at": "2026-09-04T14:30:00Z",
  "userID": "uuid-do-usuario"
}
```

---

#### DELETE `/api/comentarios/:id`
Deleta um comentário. *(Requer autenticação — apenas o autor)*

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "message": "Comentário deletado com sucesso"
}
```

---

### Favoritos

#### GET `/api/favoritos/:userId`
Lista os favoritos de um usuário.

**Response (200):**
```json
[
  {
    "id": 1,
    "userID": "uuid",
    "cidadeID": "uuid-da-cidade",
    "created_at": "2026-09-04T14:30:00Z",
    "cidade": {
      "nomeCidade": "Fortaleza",
      "url_imagem": "https://..."
    }
  }
]
```

---

#### POST `/api/favoritos/add`
Adiciona uma cidade aos favoritos. *(Requer autenticação)*

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "cidadeId": "uuid-da-cidade"
}
```

---

#### POST `/api/favoritos/remove`
Remove uma cidade dos favoritos. *(Requer autenticação)*

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "cidadeId": "uuid-da-cidade"
}
```

---

### Sugestões de Rota

#### POST `/api/sugerir`
Submete uma sugestão de nova rota. *(Requer autenticação)*

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "estado": "Piauí",
  "nomeCidade": "São Raimundo Nonato",
  "latitude": -8.8064,
  "longitude": -42.6997,
  "imagemCapa": "https://...",
  "descricaoCidade": "Conhecida como Capital Nacional do Povoado de Esperança...",
  "comoChegar": "Rodoviária com ônibus partindo de Teresina...",
  "pontosTuristicos": "Parque Nacional da Serra da Capivara...",
  "atividades": "Trilha ecológica, visita ao museu...",
  "dicas": "Leve protetor solar e água. O clima é semiárido."
}
```

**Response (201):**
```json
{
  "id": 1,
  "status": "pendente",
  "message": "Sugestão enviada com sucesso! Aguardando aprovação do admin."
}
```

---

## 3. Analytics & Notification Service

### Métricas

#### POST `/api/analytics/event`
Registra um evento de acesso/interação.

**Request:**
```json
{
  "event": "cidade_viewed",
  "data": {
    "cidadeId": "uuid-da-cidade",
    "userId": "uuid-do-usuario",
    "timestamp": "2026-09-04T14:30:00Z"
  }
}
```

**Response (200):**
```json
{
  "message": "Evento registrado",
  "eventId": 123
}
```

---

#### GET `/api/analytics/metrics/:cidadeId`
Retorna as métricas de uma cidade específica.

**Response (200):**
```json
{
  "cidadeId": "uuid",
  "totalViews": 1250,
  "totalFavorites": 89,
  "totalComments": 34,
  "avgRating": 4.5,
  "lastUpdated": "2026-09-04T14:30:00Z"
}
```

---

#### GET `/api/analytics/popular`
Retorna os destinos mais populares.

**Response (200):**
```json
{
  "topDestinos": [
    {
      "cidadeId": "uuid",
      "nomeCidade": "Fortaleza",
      "totalViews": 5000,
      "totalFavorites": 250,
      "rank": 1
    },
    {
      "cidadeId": "uuid",
      "nomeCidade": "Recife",
      "totalViews": 4500,
      "totalFavorites": 200,
      "rank": 2
    }
  ],
  "periodo": "Últimos 30 dias"
}
```

---

#### GET `/api/analytics/dashboard`
Retorna estatísticas gerais para o dashboard admin.

**Response (200):**
```json
{
  "totalUsuarios": 1500,
  "totalCidades": 45,
  "totalComentarios": 890,
  "totalFavoritos": 2300,
  "cidadesMaisAcessadas": [...],
  "atividadePorDia": [...],
  "taxaDeEngajamento": 0.67
}
```

---

### Notificações

#### GET `/api/notifications/:userId`
Lista as notificações de um usuário.

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": "uuid",
    "tipo": "sugestao_aprovada",
    "titulo": "Sugestão Aprovada!",
    "mensagem": "Sua sugestão de rota para São Raimundo Nonato foi aprovada!",
    "lida": false,
    "created_at": "2026-09-04T14:30:00Z"
  }
]
```

---

#### POST `/api/notifications/mark-read`
Marca uma notificação como lida.

**Request:**
```json
{
  "notificationId": 1
}
```

**Response (200):**
```json
{
  "message": "Notificação marcada como lida"
}
```

---

## Endpoints de Health Check

Cada serviço possui um endpoint de health check:

| Serviço | Endpoint |
|---------|----------|
| Portal & Auth | `GET /api/health` |
| Destinos Core | `GET /api/health` |
| Analytics | `GET /api/health` |

**Response (200):**
```json
{
  "status": "healthy",
  "service": "portal-auth",
  "timestamp": "2026-09-04T14:30:00Z",
  "uptime": 3600
}
```
