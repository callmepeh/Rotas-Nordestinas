# 📚 Referência da API

**Documentação completa dos endpoints de cada microsserviço**

---

## 📊 Visão Geral

| Microsserviço | Porta | Base URL |
|---------------|-------|----------|
| Portal & Auth | 3000 | `http://localhost:3000` |
| Destinos Core | 3001 | `http://localhost:3001` |
| Analytics | 3002 | `http://localhost:3002` |

---

## 🔐 Portal & Auth Service (Porta 3000)

### Autenticação

#### POST `/api/auth/register`
Cadastra um novo usuário.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "nomeCompleto": "João Silva",
  "funcao": "usuario"
}
```

**Response (201):**
```json
{
  "id": "uuid-gerado",
  "email": "usuario@email.com",
  "nomeCompleto": "João Silva",
  "token": "jwt-token-aqui"
}
```

---

#### POST `/api/auth/login`
Realiza login e retorna JWT.

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
  "token": "jwt-token-aqui",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "nomeCompleto": "João Silva"
  }
}
```

---

#### GET `/api/auth/me`
Retorna dados do usuário autenticado.

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
  "telefone": "(85) 99999-9999"
}
```

---

#### PUT `/api/auth/update/:id`
Atualiza perfil do usuário.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "nomeCompleto": "João Silva Santos",
  "telefone": "(85) 88888-8888"
}
```

**Response (200):**
```json
{
  "message": "Perfil atualizado com sucesso"
}
```

---

## 🏙️ Destinos Core Service (Porta 3001)

### Cidades

#### GET `/api/cidades`
Lista todas as cidades.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nomeCidade": "Fortaleza",
    "descricao": "Capital do Ceará...",
    "latitude": -3.7172,
    "longitude": -38.5433,
    "estadoID": 6,
    "url_imagem": "https://..."
  }
]
```

---

#### GET `/api/cidades/:id`
Busca cidade por ID.

**Response (200):**
```json
{
  "id": "uuid",
  "nomeCidade": "Fortaleza",
  "descricao": "Capital do Ceará...",
  "pontosTuristicos": [...],
  "comoChegar": [...],
  "atividades": [...],
  "dicas": [...]
}
```

---

#### GET `/api/cidades/buscar?q=:query`
Busca cidades por nome.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nomeCidade": "Fortaleza",
    "descricao": "..."
  }
]
```

---

#### POST `/api/cidades`
Cria nova cidade (admin/colaborador).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "nomeCidade": "São Luís",
  "descricao": "Capital do Maranhão...",
  "latitude": -2.5297,
  "longitude": -44.2825,
  "estadoID": 10,
  "url_imagem": "https://..."
}
```

---

### Pontos Turísticos

#### GET `/api/pontos/:cidadeId`
Lista pontos turísticos da cidade.

**Response (200):**
```json
[
  {
    "id": 1,
    "titulo": "Praia do Futuro",
    "descricao": "Uma das praias mais...",
    "url_imagem": "https://..."
  }
]
```

---

### Como Chegar

#### GET `/api/como-chegar/:cidadeId`
Lista opções de transporte.

**Response (200):**
```json
[
  {
    "id": 1,
    "tipo": "Terrestre",
    "titulo": "Rodoviária de Fortaleza",
    "descricao": "Terminal rodoviário..."
  }
]
```

---

### Atividades

#### GET `/api/atividades/:cidadeId`
Lista atividades disponíveis.

**Response (200):**
```json
[
  {
    "id": 1,
    "titulo": "Trilha do Parque Macaco",
    "descricao": "Trilha de 3km...",
    "url_imagem": "https://..."
  }
]
```

---

### Dicas

#### GET `/api/dicas/:cidadeId`
Lista dicas de viagem.

**Response (200):**
```json
[
  {
    "id": 1,
    "titulo": "Melhor época para visitar",
    "descricao": "O melhor período é entre...",
    "url_imagem": "https://..."
  }
]
```

---

### Comentários

#### GET `/api/comentarios/por-cidade/:cidadeId`
Lista comentários da cidade.

**Response (200):**
```json
[
  {
    "id": 1,
    "userID": "uuid-usuario",
    "mensagem": "Lugar incrível!",
    "created_at": "2026-09-04T14:30:00Z"
  }
]
```

---

#### POST `/api/comentarios`
Cria novo comentário.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "cidadeId": "uuid-cidade",
  "mensagem": "Amei a praia!"
}
```

---

### Favoritos

#### POST `/api/favoritos/add`
Adiciona cidade aos favoritos.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "cidadeId": "uuid-cidade"
}
```

---

#### POST `/api/favoritos/remove`
Remove cidade dos favoritos.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "cidadeId": "uuid-cidade"
}
```

---

### Sugestões

#### POST `/api/sugerir`
Submete sugestão de nova cidade.

**Request:**
```json
{
  "estado": "Ceará",
  "nomeCidade": "Jericoacoara",
  "latitude": -2.7956,
  "longitude": -40.5117,
  "descricaoCidade": "Vila de pescadores...",
  "comoChegar": "De Fortaleza, 300km...",
  "pontosTuristicos": "Lagoa Azul, Duna do Sunset...",
  "atividades": "Kitesurf, buggy, passeio de jangada...",
  "dicas": "Levar protetor solar..."
}
```

---

## 📊 Analytics Service (Porta 3002)

### Eventos

#### POST `/api/analytics/event`
Registra evento de acesso.

**Request:**
```json
{
  "event": "cidade_viewed",
  "data": {
    "cidadeId": "uuid-cidade",
    "userId": "uuid-usuario",
    "timestamp": "2026-09-04T14:30:00Z"
  }
}
```

---

### Métricas

#### GET `/api/analytics/metrics/:cidadeId`
Retorna métricas de uma cidade.

**Response (200):**
```json
{
  "cidadeId": "uuid",
  "totalViews": 1500,
  "totalFavorites": 230,
  "totalComments": 45,
  "avgRating": 4.5
}
```

---

#### GET `/api/analytics/popular`
Lista destinos mais populares.

**Response (200):**
```json
[
  {
    "cidadeId": "uuid",
    "nomeCidade": "Fortaleza",
    "totalViews": 5000,
    "ranking": 1
  }
]
```

---

#### GET `/api/analytics/dashboard`
Dashboard de estatísticas (admin).

**Response (200):**
```json
{
  "totalViews": 50000,
  "totalUsers": 1200,
  "totalComments": 450,
  "topCities": [...],
  "recentActivity": [...]
}
```

---

### Notificações

#### GET `/api/notifications/:userId`
Lista notificações do usuário.

**Response (200):**
```json
[
  {
    "id": 1,
    "tipo": "sugestao_aprovada",
    "titulo": "Sugestão Aprovada!",
    "mensagem": "Sua sugestão de Jericoacoara foi aprovada.",
    "lida": false,
    "created_at": "2026-09-04T14:30:00Z"
  }
]
```

---

#### POST `/api/notifications/mark-read`
Marca notificação como lida.

**Request:**
```json
{
  "notificationId": 1
}
```

---

## 🔐 Autenticação

### Como usar JWT

1. **Fazer login** para obter o token
2. **Enviar token** em todas as requisições autenticadas

```
Authorization: Bearer <seu-jwt-token>
```

### Exemplo em JavaScript

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@email.com', password: '123' })
});
const { token } = await response.json();

// Usar token
const cidades = await fetch('http://localhost:3001/api/cidades', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## ❌ Erros Comuns

| Código | Significado | Ação |
|--------|-------------|------|
| 400 | Bad Request | Verificar dados enviados |
| 401 | Unauthorized | Verificar token JWT |
| 403 | Forbidden | Usuário sem permissão |
| 404 | Not Found | Recurso não existe |
| 409 | Conflict | Dados duplicados |
| 500 | Server Error | Erro interno do servidor |

---

*Referência da API — Rotas Nordestinas 2026.2*
