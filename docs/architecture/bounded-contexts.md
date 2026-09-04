# 🎯 Bounded Contexts — Decomposição em Microsserviços

**Como o sistema é dividido em partes independentes usando Domain-Driven Design**

---

## 📋 O que são Bounded Contexts?

Um **Bounded Context** é uma fronteira dentro da qual um modelo específico é definido e consistente. Cada microsserviço opera dentro do seu próprio bounded context, com seu próprio banco de dados e regras de negócio.

### Analogia
Pense em um shopping center:
- **Loja de roupas** = Portal & Auth ( Interface + Identidade)
- **Departamento de turismo** = Destinos Core ( Conteúdo Turístico)
- **Escritório de estatísticas** = Analytics ( Métricas + Alertas)

Cada loja tem seu próprio estoque (banco de dados) e suas próprias regras.

---

## 🔐 Microsserviço 1: Portal & Auth Service

### Responsabilidade
Ponto de entrada da aplicação. Interface visual e controle de identidade.

### O que faz
```
✅ Mostra o site (frontend Next.js)
✅ Gerencia login e cadastro
✅ Gera tokens JWT (senhas digitais)
✅ Gerencia perfis de usuário
✅ Verifica se o usuário está autenticado
```

### Banco de Dados (PostgreSQL)
```sql
CREATE TABLE Users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nomeCompleto VARCHAR(255) NOT NULL,
  funcao VARCHAR(50) NOT NULL DEFAULT 'usuario',
  telefone VARCHAR(20),
  dataNascimento DATE,
  siglaEstado VARCHAR(2),
  nomeCidade VARCHAR(255),
  profissao VARCHAR(255),
  cpf VARCHAR(14),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Endpoints
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro de novo usuário |
| POST | `/api/auth/login` | Login e retorno de JWT |
| GET | `/api/auth/me` | Dados do usuário autenticado |
| PUT | `/api/auth/update/:id` | Atualizar perfil |

### Tecnologias
- Next.js 15 (frontend + API Routes)
- TypeScript
- JWT (jsonwebtoken)
- PostgreSQL (banco isolado)

### Provedor
AWS (EC2 para dev, ECS para produção)

---

## 🏙️ Microsserviço 2: Destinos Core Service

### Responsabilidade
Núcleo transacional do conteúdo turístico. Gerencia todo o conteúdo de destinos do Nordeste.

### O que faz
```
✅ CRUD de Cidades (criar, ler, atualizar, deletar)
✅ Pontos Turísticos de cada cidade
✅ Informações "Como Chegar"
✅ Atividades disponíveis
✅ Dicas de viagem
✅ Sistema de Comentários
✅ Sistema de Favoritos
✅ Fluxo de Sugestões de Rota
```

### Banco de Dados (PostgreSQL)
```sql
-- Tabelas exclusivas deste serviço
CREATE TABLE Cidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomeCidade VARCHAR(255) NOT NULL,
  url_imagem TEXT,
  descricao TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  estadoID INTEGER NOT NULL,
  userID UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Pontos_Turisticos (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  url_imagem TEXT
);

CREATE TABLE Como_Chegar (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id),
  tipo VARCHAR(50) DEFAULT 'Terrestre',
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT
);

CREATE TABLE Atividades (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  url_imagem TEXT
);

CREATE TABLE Dicas (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  url_imagem TEXT
);

CREATE TABLE Comentarios (
  id BIGSERIAL PRIMARY KEY,
  userID UUID NOT NULL,
  cidadeID UUID NOT NULL REFERENCES Cidades(id),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE Favoritos (
  id BIGSERIAL PRIMARY KEY,
  userID UUID NOT NULL,
  cidadeID UUID NOT NULL REFERENCES Cidades(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(userID, cidadeID)
);

CREATE TABLE Sugestoes_de_Rota (
  id BIGSERIAL PRIMARY KEY,
  userID UUID NOT NULL,
  estado VARCHAR(100) NOT NULL,
  nomeCidade VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  imagemCapa TEXT,
  descricaoCidade TEXT,
  comoChegar TEXT,
  pontosTuristicos TEXT,
  atividades TEXT,
  dicas TEXT,
  status VARCHAR(20) DEFAULT 'pendente',
  cidadeID UUID REFERENCES Cidades(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Endpoints Principais
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/cidades` | Listar todas as cidades |
| GET | `/api/cidades/:id` | Buscar cidade por ID |
| GET | `/api/cidades/buscar?q=` | Buscar cidades por nome |
| POST | `/api/cidades` | Criar cidade (admin) |
| GET | `/api/pontos/:cidadeId` | Pontos turísticos da cidade |
| GET | `/api/como-chegar/:cidadeId` | Como chegar na cidade |
| GET | `/api/atividades/:cidadeId` | Atividades da cidade |
| GET | `/api/dicas/:cidadeId` | Dicas da cidade |
| GET | `/api/comentarios/por-cidade/:cidadeId` | Comentários da cidade |
| POST | `/api/comentarios` | Criar comentário |
| POST | `/api/favoritos/add` | Adicionar favorito |
| POST | `/api/favoritos/remove` | Remover favorito |
| POST | `/api/sugerir` | Submeter sugestão de rota |

### Tecnologias
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (banco isolado)

### Provedor
AWS (EC2/ECS + RDS)

---

## 📊 Microsserviço 3: Analytics & Notification Service

### Responsabilidade
Computar métricas de uso, identificar tendências e disparar notificações.

### O que faz
```
✅ Registra cada acesso/interação
✅ Calcula destinos mais populares
✅ Métricas de engajamento
✅ Dashboard de estatísticas (admin)
✅ Notifica quando sugestão é aprovada
✅ Alertas de atividade suspeita
```

### Banco de Dados (SQLite)
```sql
-- Tabelas exclusivas deste serviço
CREATE TABLE AccessLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT,
  cidadeId TEXT,
  action TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DestinoMetrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cidadeId TEXT NOT NULL,
  totalViews INTEGER DEFAULT 0,
  totalFavorites INTEGER DEFAULT 0,
  totalComments INTEGER DEFAULT 0,
  avgRating REAL DEFAULT 0,
  lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AlertRules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  regra TEXT NOT NULL,
  limite INTEGER NOT NULL,
  ativa BOOLEAN DEFAULT 1
);
```

### Endpoints
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/analytics/event` | Registrar evento de acesso |
| GET | `/api/analytics/metrics/:cidadeId` | Métricas de uma cidade |
| GET | `/api/analytics/dashboard` | Dashboard de estatísticas |
| GET | `/api/notifications/:userId` | Notificações do usuário |
| POST | `/api/notifications/mark-read` | Marcar notificação como lida |
| GET | `/api/analytics/popular` | Top destinos mais acessados |

### Tecnologias
- Node.js
- Express
- SQLite (banco local rápido)
- Bull Queue (fila de processamento assíncrono)

### Provedor
GCP (Compute Engine) — para cenário multi-cloud

---

## 🔗 Por que 3 Microsserviços?

A professora Juliana propôs um projeto chamado **HealthCloud** (plataforma de saúde) com exatamente 3 microsserviços. Nós adaptamos essa arquitetura para o nosso domínio de turismo:

| HealthCloud (Proposta) | Rotas Nordestinas (Nosso Projeto) |
|------------------------|-----------------------------------|
| Portal & Auth Service | **Portal & Auth Service** |
| Clinical Core Service | **Destinos Core Service** |
| Analytics & Alert Service | **Analytics & Notification Service** |

A divisão em 3 segue o princípio de **Bounded Contexts** do Domain-Driven Design: cada serviço representa uma "capacidade de negócio" distinta.

---

*Bounded Contexts — Rotas Nordestinas 2026.2*
