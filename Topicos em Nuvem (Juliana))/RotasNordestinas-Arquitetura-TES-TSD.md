# Rotas Nordestinas — Arquitetura para TES (Graduação) e TSD (Pós-Graduação)

**Projeto:** Rotas Nordestinas — Plataforma de Turismo no Nordeste Brasileiro
**Instituição:** Universidade Federal do Piauí (UFPI) — Campus Senador Helvídio Nunes de Barros
**Docente:** Profª Dra. Juliana Oliveira de Carvalho
**Período:** 2026.2
**Discente:** [Seu Nome]

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Problema e Justificativa](#2-problema-e-justificativa)
3. [Decomposição em Microsserviços (3 Bounded Contexts)](#3-decomposição-em-microsserviços)
4. [Arquitetura Geral do Sistema](#4-arquitetura-geral-do-sistema)
5. [Especificação de Cada Microsserviço](#5-especificação-de-cada-microsserviço)
6. [Estratégia de Comunicação entre Serviços](#6-estratégia-de-comunicação-entre-serviços)
7. [Estratégia de Persistência (Database per Service)](#7-estratégia-de-persistência)
8. [Fase Mononuvem — TES (Graduação)](#8-fase-mononuvem--tes-graduação)
9. [Fase Multinuvem — TSD (Pós-Graduação)](#9-fase-multinuvem--tsd-pós-graduação)
10. [Testes de Carga e Observabilidade](#10-testes-de-carga-e-observabilidade)
11. [Cronograma e Entregas](#11-cronograma-e-entregas)
12. [Comparação com o Projeto HealthCloud (Roteiro da Professora)](#12-comparação-com-o-projeto-healthcloud)

---

## 1. Visão Geral do Projeto

O **Rotas Nordestinas** é uma plataforma web de turismo focada no Nordeste brasileiro, permitindo que usuários descubram cidades, pontos turísticos, rotas de acesso, atividades e dicas de viagem. O sistema atual é um **monólito Next.js** com backend integrado (API Routes) e banco de dados Supabase (PostgreSQL).

### Estado Atual (Monólito)

```
┌─────────────────────────────────────────────┐
│              Next.js Monolith               │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Frontend │  │ API Routes│  │ Supabase  │  │
│  │ (React)  │  │ (Node.js)│  │ (Postgres)│  │
│  └─────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────┘
```

**Tecnologias atuais:**
- Frontend: Next.js 15 + React 19 + TypeScript
- Backend: Next.js API Routes (Node.js)
- Banco: Supabase (PostgreSQL) com RLS
- Autenticação: Supabase Auth
- Mapas: Leaflet + React-Leaflet
- HTTP Client: Axios

---

## 2. Problema e Justificativa

### Para TES (Graduação — Tópicos Especiais em Engenharia de Software)
Demonstrar competência em:
- **Microsserviços** com isolamento de banco de dados por serviço
- **Containerização** com Docker
- **Implantação na AWS** nas modalidades sem contêiner (EC2) e com contêiner (Docker Compose)
- **Análise comparativa** de overhead de virtualização

### Para TSD (Pós-Graduação — Tópicos Avançados em Sistemas Distribuídos)
Demonstrar competência em:
- **Multi-cloud** (AWS + Google Cloud Platform)
- **Comunicação assíncrona** baseada em eventos/mensageria
- **Testes de estresse** com cargas concorrentes (k6)
- **Latência de rede inter-cloud** e análise de gargalos
- **Artigo científico** com experimentos e resultados

---

## 3. Decomposição em Microsserviços

### Princípio de Decomposição: Bounded Contexts (Domain-Driven Design)

A divisão em 3 microsserviços segue o princípio de **Capacidade de Negócio**, evitando o antipadrão de "monólito distribuído". Cada serviço é independente, auto-contido e possui seu próprio banco de dados.

### Os 3 Microsserviços

| # | Microsserviço | Bounded Context | Tecnologia | Provedor Principal |
|---|--------------|-----------------|------------|-------------------|
| 1 | **Portal & Auth Service** | Interface + Identidade | Next.js / TypeScript / JWT | AWS (EC2 / ECS) |
| 2 | **Destinos Core Service** | Conteúdo Turístico Transacional | Node.js / Express / PostgreSQL | AWS (EC2 / ECS / RDS) |
| 3 | **Analytics & Notification Service** | Métricas + Alertas | Node.js / SQLite (local) | GCP (Compute Engine) |

### Diagrama de Bounded Contexts

```
┌──────────────────────────────────────────────────────────────────────┐
│                        ROTAS NORDESTINAS                             │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │   Portal & Auth  │  │  Destinos Core    │  │  Analytics &       │  │
│  │   Service        │  │  Service          │  │  Notification      │  │
│  │                  │  │                   │  │  Service           │  │
│  │ • Frontend Next  │  │ • CRUD Cidades    │  │ • Métricas pop.    │  │
│  │ • Login/Cadastro │  │ • Pontos Turíst.  │  │ • Top destinos     │  │
│  │ • JWT Tokens     │  │ • Como Chegar     │  │ • Engajamento      │  │
│  │ • Perfil Usuário │  │ • Atividades      │  │ • Notificações     │  │
│  │                  │  │ • Dicas           │  │ • Dashboard stats  │  │
│  │ DB: Users, Auth  │  │ • Comentários     │  │                    │  │
│  │                  │  │ • Favoritos       │  │ DB: Analytics,     │  │
│  │                  │  │ • Sugestões       │  │      Notifications │  │
│  │                  │  │                   │  │                    │  │
│  │                  │  │ DB: Cidades,      │  │                    │  │
│  │                  │  │ Pontos, Ativ.,    │  │                    │  │
│  │                  │  │ Dicas, Coment.,   │  │                    │  │
│  │                  │  │ Favoritos, etc.   │  │                    │  │
│  └─────────────────┘  └──────────────────┘  └────────────────────┘  │
│         AWS                     AWS                     GCP          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Arquitetura Geral do Sistema

### 4.1 Fase Mononuvem (TES — Graduação)

```
                    ┌─────────────┐
                    │   Usuário   │
                    │  (Browser)  │
                    └──────┬──────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │   Portal &  │
                    │  Auth       │
                    │  (AWS EC2)  │
                    └──────┬──────┘
                           │ HTTP/REST (síncrono)
                    ┌──────▼──────┐
                    │  Destinos   │
                    │  Core       │
                    │  (AWS EC2)  │
                    └──────┬──────┘
                           │ HTTP/REST (async fire-and-forget)
                    ┌──────▼──────┐
                    │  Analytics  │
                    │  & Notif.   │
                    │  (AWS EC2)  │
                    └─────────────┘
```

### 4.2 Fase Multinuvem (TSD — Pós-Graduação)

```
                    ┌─────────────┐
                    │   Usuário   │
                    │  (Browser)  │
                    └──────┬──────┘
                           │ HTTPS
              ╔════════════▼════════════╗
              ║         AWS             ║
              ║  ┌──────────────┐       ║
              ║  │  Portal &    │       ║
              ║  │  Auth        │       ║
              ║  │  (EC2/ECS)   │       ║
              ║  └──────┬───────┘       ║
              ║         │ HTTP/REST     ║
              ║  ┌──────▼───────┐       ║
              ║  │  Destinos    │       ║
              ║  │  Core        │       ║
              ║  │  (EC2/ECS)   │       ║
              ║  └──────┬───────┘       ║
              ╚═════════╪═══════════════╝
                        │ Message Broker
                        │ (RabbitMQ / Cloud Pub/Sub)
              ╔═════════╪═══════════════╗
              ║    GCP  │               ║
              ║  ┌──────▼───────┐       ║
              ║  │  Analytics   │       ║
              ║  │  & Notif.    │       ║
              ║  │  (Compute    │       ║
              ║  │   Engine)    │       ║
              ║  └──────────────┘       ║
              ╚═════════════════════════╝
```

---

## 5. Especificação de Cada Microsserviço

### 5.1 Portal & Auth Service

**Responsabilidade:** Ponto de entrada da aplicação, frontend e controle de identidade.

**Funcionalidades:**
- Servir o frontend Next.js (páginas: Home, Destinos, Perfil, Favoritos, Sugestir Rota)
- Endpoints de autenticação: login, register, logout, me (perfil)
- Geração e validação de tokens JWT
- Gerenciamento de perfis de usuário (nome, email, função, telefone, etc.)
- Middleware de autenticação para proteger rotas

**Banco de Dados (PostgreSQL isolado):**
```sql
-- Tabelas exclusivas deste serviço
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

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro de novo usuário |
| POST | `/api/auth/login` | Login e retorno de JWT |
| GET | `/api/auth/me` | Dados do usuário autenticado |
| PUT | `/api/auth/update/:id` | Atualizar perfil |
| GET | `/api/users/:id` | Buscar usuário por ID |

**Tecnologias:**
- Next.js 15 (frontend + API Routes)
- TypeScript
- JWT (jsonwebtoken)
- Prisma ou drizzle-orm (ORM)
- PostgreSQL (banco isolado)

**Provedor:** AWS (EC2 para dev, ECS para produção)

---

### 5.2 Destinos Core Service

**Responsabilidade:** Núcleo transacional do conteúdo turístico. Gerencia todo o conteúdo de destinos do Nordeste.

**Funcionalidades:**
- CRUD completo de Cidades (com imagem, descrição, coordenadas)
- Gerenciamento de Pontos Turísticos por cidade
- Informações "Como Chegar" (terrestre, aéreo, marítimo)
- Atividades e Dicas por cidade
- Sistema de Comentários (CRUD por usuário)
- Sistema de Favoritos (toggle por usuário)
- Fluxo de Sugestões de Rota (submissão → aprovação admin → publicação)

**Banco de Dados (PostgreSQL isolado):**
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

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/cidades` | Listar todas as cidades |
| GET | `/api/cidades/:id` | Buscar cidade por ID |
| GET | `/api/cidades/buscar?q=` | Buscar cidades por nome |
| POST | `/api/cidades` | Criar cidade (admin/colab) |
| PUT | `/api/cidades/:id` | Atualizar cidade |
| DELETE | `/api/cidades/:id` | Deletar cidade |
| GET | `/api/pontos/:cidadeId` | Pontos turísticos da cidade |
| GET | `/api/como-chegar/:cidadeId` | Como chegar na cidade |
| GET | `/api/atividades/:cidadeId` | Atividades da cidade |
| GET | `/api/dicas/:cidadeId` | Dicas da cidade |
| GET | `/api/comentarios/por-cidade/:cidadeId` | Comentários da cidade |
| POST | `/api/comentarios` | Criar comentário |
| DELETE | `/api/comentarios/:id` | Deletar comentário |
| GET | `/api/favoritos/:userId` | Favoritos do usuário |
| POST | `/api/favoritos/add` | Adicionar favorito |
| POST | `/api/favoritos/remove` | Remover favorito |
| POST | `/api/sugerir` | Submeter sugestão de rota |

**Tecnologias:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (banco isolado)

**Provedor:** AWS (EC2/ECS + RDS)

---

### 5.3 Analytics & Notification Service

**Responsabilidade:** Computar métricas de uso, identificar tendências e disparar notificações.

**Funcionalidades:**
- Registrar访问s e interações dos usuários
- Calcular destinos mais populares
- Métricas de engajamento (favoritos, comentários, tempo de permanência)
- Dashboard de estatísticas para o admin
- Notificar quando uma sugestão de rota é aprovada/rejeitada
- Alertas de atividade suspeita (spam de comentários, etc.)

**Banco de Dados (SQLite local — rápido e leve):**
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

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/analytics/event` | Registrar evento de acesso |
| GET | `/api/analytics/metrics/:cidadeId` | Métricas de uma cidade |
| GET | `/api/analytics/dashboard` | Dashboard de estatísticas |
| GET | `/api/notifications/:userId` | Notificações do usuário |
| POST | `/api/notifications/mark-read` | Marcar notificação como lida |
| GET | `/api/analytics/popular` | Top destinos mais acessados |

**Tecnologias:**
- Node.js (ou Python)
- Express
- SQLite (banco local rápido)
- Bull Queue (fila de processamento assíncrono)

**Provedor:** GCP (Compute Engine) — para cenário multi-cloud

---

## 6. Estratégia de Comunicação entre Serviços

### 6.1 Comunicação Síncrona (Portal → Destinos Core)

O Portal precisa listar instantaneamente cidades, pontos turísticos e dados em tela. As chamadas de leitura (GET) e escrita (POST) ocorrem em canal síncrono via HTTP/REST.

```
Portal & Auth ──────HTTP/REST──────► Destinos Core
                         │
                    Tempo de resposta
                    imediato (< 200ms)
```

**Implementação:**
```typescript
// Portal & Auth Service — chamada ao Destinos Core
const response = await fetch(`${DESTINOS_CORE_URL}/api/cidades`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const cidades = await response.json();
```

### 6.2 Comunicação Assíncrona (Destinos Core → Analytics)

Para não impactar o tempo de resposta ao salvar dados, a análise é totalmente desacoplada.

**Modalidade Mononuvem (TES):** HTTP paralelo assíncrono (fire-and-forget)
```
Destinos Core ──HTTP async──► Analytics Service
      │                              │
  Resposta imediata            Processamento
  ao usuário                   em background
```

**Modalidade Multinuvem (TSD):** Message Broker
```
Destinos Core ──► RabbitMQ/Pub/Sub ──► Analytics Service
      │                   │                    │
  Publica evento     Broker garante      Consome e
  (cidade criada,    entrega confiável   processa
  comentário add)    entre AWS e GCP
```

**Evento publicado (exemplo):**
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

### 6.3 Tabela de Comunicação

| Origem | Destino | Tipo | Protocolo | Quando |
|--------|---------|------|-----------|--------|
| Portal | Destinos Core | Síncrono | HTTP/REST | Listar cidades, buscar detalhes |
| Portal | Destinos Core | Síncrono | HTTP/REST | Criar/deletar comentários |
| Portal | Destinos Core | Síncrono | HTTP/REST | Gerenciar favoritos |
| Portal | Destinos Core | Síncrono | HTTP/REST | Submeter sugestões |
| Destinos Core | Analytics | Assíncrono | HTTP/Pub/Sub | Quando cidade é acessada |
| Destinos Core | Analytics | Assíncrono | HTTP/Pub/Sub | Quando comentário é criado |
| Destinos Core | Analytics | Assíncrono | HTTP/Pub/Sub | Quando favorito é adicionado |
| Analytics | Portal | Síncrono | HTTP/REST | Buscar métricas do dashboard |
| Analytics | Portal | Assíncrono | WebSocket/SSE | Notificações em tempo real |

---

## 7. Estratégia de Persistência

### Princípio: Database per Service

Cada microsserviço possui seu próprio banco de dados. **Não há compartilhamento de banco.**

| Microsserviço | Banco | Tipo | Justificativa |
|--------------|-------|------|---------------|
| Portal & Auth | `rotas_auth_db` | PostgreSQL | Dados sensíveis (usuários, senhas, JWT) |
| Destinos Core | `rotas_core_db` | PostgreSQL | Dados transacionais (cidades, comentários, favoritos) |
| Analytics | `rotas_analytics_db` | SQLite | Dados de métricas, rápido e local |

### Vantagens deste approach:
- **Isolamento:** Falha em um banco não afeta os outros
- **Escalabilidade:** Cada banco pode escalar independentemente
- **Flexibilidade:** Cada serviço escolhe a tecnologia ideal
- **Segurança:** Dados sensíveis isolados do conteúdo público

---

## 8. Fase Mononuvem — TES (Graduação)

### 8.1 Trabalho 3.1: Implantação Pura (EC2)

Instanciação dos 3 microsserviços em servidores virtuais Amazon EC2 independentes.

**Passo a passo:**
1. Criar 3 instâncias EC2 (t2.micro ou t3.small)
2. Configurar Security Groups (portas 3000, 3001, 3002)
3. Instalar Node.js + npm em cada instância
4. Clonar o repositório e instalar dependências
5. Configurar variáveis de ambiente
6. Iniciar cada serviço com PM2
7. Configurar Nginx como reverse proxy

**Arquitetura de implantação:**
```
EC2 #1: Portal & Auth (port 3000)
  └── Nginx → porta 80/443
  
EC2 #2: Destinos Core (port 3001)
  └── API interna
  
EC2 #3: Analytics (port 3002)
  └── API interna
  
EC2 #4: PostgreSQL (port 5432)
  └── Banco do Portal + Core (ou RDS)
```

### 8.2 Trabalho 3.2: Implantação com Contêineres (Docker)

Empacotamento de cada microsserviço em imagens Docker + orquestração com Docker Compose.

**Dockerfile do Portal & Auth:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

**Dockerfile do Destinos Core:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

**docker-compose.yml (Mononuvem):**
```yaml
version: '3.8'

services:
  # ─── Banco de Dados Auth ───
  auth-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: rotas_auth_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${AUTH_DB_PASSWORD}
    volumes:
      - auth_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - rotas-network

  # ─── Banco de Dados Core ───
  core-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: rotas_core_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${CORE_DB_PASSWORD}
    volumes:
      - core_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - rotas-network

  # ─── Portal & Auth Service ───
  portal-auth:
    build:
      context: ./portal-auth-service
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:${AUTH_DB_PASSWORD}@auth-db:5432/rotas_auth_db
      JWT_SECRET: ${JWT_SECRET}
      DESTINOS_CORE_URL: http://destinos-core:3001
      ANALYTICS_URL: http://analytics:3002
    depends_on:
      - auth-db
      - destinos-core
      - analytics
    networks:
      - rotas-network

  # ─── Destinos Core Service ───
  destinos-core:
    build:
      context: ./destinos-core-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://admin:${CORE_DB_PASSWORD}@core-db:5432/rotas_core_db
      ANALYTICS_URL: http://analytics:3002
    depends_on:
      - core-db
    networks:
      - rotas-network

  # ─── Analytics & Notification Service ───
  analytics:
    build:
      context: ./analytics-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      DB_PATH: /data/analytics.db
    volumes:
      - analytics_data:/data
    networks:
      - rotas-network

volumes:
  auth_data:
  core_data:
  analytics_data:

networks:
  rotas-network:
    driver: bridge
```

### 8.3 Trabalho 3.3: Artigo Comparativo

Artigo científico comparando:
- **Consumo de recursos** (CPU e memória) entre EC2 puro vs Docker
- **Tempo de resposta médio** da aplicação
- **Facilidade de deployment** e manutenção
- **Overhead de virtualização** induzido pelo Docker

**Métricas a coletar:**
```bash
# Comando para monitorar recursos
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
htop  # no EC2 sem Docker

# Benchmark de tempo de resposta
ab -n 1000 -c 50 http://<ec2-ip>/api/cidades
wrk -t4 -c100 -d30s http://<ec2-ip>/api/cidades
```

---

## 9. Fase Multinuvem — TSD (Pós-Graduação)

### 9.1 Cenário Multinuvem Distribuído

| Serviço | Provedor | Região | Justificativa |
|---------|----------|--------|---------------|
| Portal & Auth | AWS | us-east-1 | Ponto de entrada, mais próximo do usuário |
| Destinos Core | AWS | us-east-1 | Serviço transacional, baixa latência com Portal |
| Analytics | GCP | us-east1 (Iowa) | Cenário prático multinuvem |
| RabbitMQ/Pub/Sub | GCP | us-east1 | Broker de mensagens entre provedores |

### 9.2 Comunicação Inter-Cloud

```
AWS (us-east-1)                    GCP (us-east1)
┌──────────────────┐              ┌──────────────────┐
│ Portal & Auth    │              │                  │
│     │            │              │   Analytics &    │
│     ▼            │              │   Notification   │
│ Destinos Core ───┼──Pub/Sub────►│   Service        │
│                  │  (async)     │                  │
└──────────────────┘              └──────────────────┘
         │                                 │
         └──── Latência inter-cloud ───────┘
               (medir: 50-200ms)
```

### 9.3 Setup Multi-Cloud com Cloud Pub/Sub

**Destinos Core (AWS) — Publica eventos:**
```typescript
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub({
  projectId: 'rotas-nordestinas-gcp',
  keyFilename: './gcp-service-account.json'
});

const topic = pubsub.topic('rotas-events');

// Publicar evento quando cidade é acessada
async function publishCidadeEvent(event: string, data: object) {
  const message = {
    data: Buffer.from(JSON.stringify({ event, data, timestamp: new Date().toISOString() }))
  };
  await topic.publishMessage(message);
}
```

**Analytics Service (GCP) — Consome eventos:**
```typescript
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub({
  projectId: 'rotas-nordestinas-gcp'
});

const subscription = pubsub.subscription('rotas-analytics-sub');

subscription.on('message', async (message) => {
  const event = JSON.parse(message.data.toString());
  
  // Processar evento
  await processEvent(event);
  
  message.ack();
});
```

### 9.4 Setup com RabbitMQ (Alternativa)

```yaml
# Adicionar ao docker-compose.yml na versão multinuvem
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    networks:
      - rotas-network
```

### 9.5 Testes de Carga com k6

```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up
    { duration: '1m', target: 50 },    // Sustained load
    { duration: '30s', target: 100 },  // Peak
    { duration: '1m', target: 500 },   // Stress test
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Teste 1: Listar cidades
  let res = http.get(`${BASE_URL}/api/cidades`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Teste 2: Buscar cidade específica
  res = http.get(`${BASE_URL}/api/cidades/buscar?q=Fortaleza`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has results': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(1);

  // Teste 3: Criar comentário (autenticado)
  const payload = JSON.stringify({
    cidadeId: 'some-uuid',
    mensagem: 'Lugar incrível!'
  });
  
  res = http.post(`${BASE_URL}/api/comentarios`, payload, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`
    },
  });
  
  check(res, {
    'comment created': (r) => r.status === 201,
  });

  sleep(Math.random() * 3);
}

// Relatório de resultados
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
```

**Execução:**
```bash
# Teste local
k6 run k6/load-test.js

# Teste na nuvem (multi-cloud)
k6 run --env BASE_URL=https://api.rotnordestinas.com k6/load-test.js

# Comparar latência AWS→GCP vs AWS→AWS
k6 run --env BASE_URL=http://<analytics-gcp-ip>:3002 k6/load-test.js
```

---

## 10. Testes de Carga e Observabilidade

### 10.1 Métricas a Coletar

| Métrica | Ferramenta | Onde Coletar |
|---------|-----------|--------------|
| Latência HTTP | k6, Prometheus | Todos os serviços |
| CPU Usage | Docker stats, CloudWatch | EC2/ECS |
| Memory Usage | Docker stats, CloudWatch | EC2/ECS |
| Throughput (req/s) | k6 | Load balancer |
| Error Rate | k6, Sentry | Todos os serviços |
| Inter-cloud latency | k6, Ping | AWS ↔ GCP |

### 10.2 Observabilidade

```
┌─────────────────────────────────────────────────┐
│              Observability Stack                 │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Prometheus│  │ Grafana  │  │   Sentry     │  │
│  │ (Metrics) │  │ (Dashbrd)│  │  (Errors)    │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  ┌──────────┐  ┌──────────┐                     │
│  │  Jaeger  │  │   k6     │                     │
│  │ (Traces) │  │ (Load)   │                     │
│  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────┘
```

---

## 11. Cronograma e Entregas

### TES (Graduação) — Cronograma

| Data | Entrega | Descrição | Nota |
|------|---------|-----------|------|
| 15/09/2026 | Avaliação 1.1 | Artigo Survey (comparação serviços cloud) | 5.00 |
| 20/10/2026 | Avaliação 1.2 | Artigo Survey (virtualização/containers) | 5.00 |
| 27/10/2026 | Entrega Parcial | 30% da aplicação | - |
| 17/11/2026 | Trabalho 3.1 | Aplicação implantada na AWS (EC2 puro) | 3.00 |
| 01/12/2026 | Trabalho 3.2 | Aplicação com Docker implantada na AWS | 3.00 |
| 08/12/2026 | Trabalho 3.3 | Artigo comparativo (sem vs com containers) | 4.00 |

### TSD (Pós-Graduação) — Cronograma

| Data | Entrega | Descrição | Nota |
|------|---------|-----------|------|
| 02/10/2026 | Avaliação 1.1 | Artigo Survey | 5.00 |
| 16/10/2026 | Avaliação 1.2 | Artigo Survey | 5.00 |
| 16/11/2026 | Trabalho 2.1 | App web implantada AWS + GCP | 2.50 |
| 23/11/2026 | Trabalho 2.2 | App web Docker implantada na AWS | 2.50 |
| 16/11/2026 | Trabalho 3.1 | Microsserviços em múltiplos provedores sem containers | 5.00 |
| 23/11/2026 | Trabalho 3.2 | Microsserviços em múltiplos provedores com containers | 5.00 |
| 11/12/2026 | Projeto Final | Artigo com experimentos de acessos simultâneos | - |

---

## 12. Comparação com o Projeto HealthCloud

O roteiro da professora Juliana propõe o projeto **HealthCloud** (plataforma de telessaúde). O **Rotas Nordestinas** segue a mesma arquitetura compacta de 3 microsserviços, adaptando o domínio:

| HealthCloud (Roteiro) | Rotas Nordestinas (Nosso Projeto) |
|----------------------|-----------------------------------|
| Portal & Auth Service | Portal & Auth Service (idêntico) |
| Clinical Core Service | Destinos Core Service |
| Analytics & Alert Service | Analytics & Notification Service |
| Banco: PostgreSQL + SQLite | Banco: PostgreSQL + SQLite (mesmo) |
| Comunicação: REST + async | Comunicação: REST + async (mesmo) |
| Multi-cloud: AWS + GCP | Multi-cloud: AWS + GCP (mesmo) |

**Vantagem do Rotas Nordestinas:** O projeto já existe como monólito, facilitando a demonstração da evolução arquitetural (monólito → microsserviços).

---

## Estrutura de Pastas Proposta

```
rotas-nordestinas/
├── portal-auth-service/          # Microsserviço 1
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   ├── lib/
│   │   │   ├── auth.ts           # JWT utils
│   │   │   └── prisma.ts         # ORM client
│   │   └── types/
│   ├── prisma/
│   │   └── schema.prisma         # Schema do Auth DB
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── destinos-core-service/        # Microsserviço 2
│   ├── src/
│   │   ├── routes/
│   │   │   ├── cidades.ts
│   │   │   ├── pontos.ts
│   │   │   ├── comentarios.ts
│   │   │   ├── favoritos.ts
│   │   │   └── sugerir.ts
│   │   ├── middleware/
│   │   └── services/
│   ├── prisma/
│   │   └── schema.prisma         # Schema do Core DB
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── analytics-service/            # Microsserviço 3
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analytics.ts
│   │   │   └── notifications.ts
│   │   ├── consumers/
│   │   │   └── eventConsumer.ts  # Consome do Pub/Sub
│   │   └── services/
│   ├── db/
│   │   └── schema.sql            # SQLite schema
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml            # Orquestração local
├── docker-compose.prod.yml       # Orquestração produção
├── k6/
│   ├── load-test.js
│   └── stress-test.js
├── infra/
│   ├── aws/
│   │   ├── ec2-setup.sh
│   │   └── ecs-task-definitions/
│   └── gcp/
│       ├── compute-engine-setup.sh
│       └── pubsub-topics/
├── docs/
│   ├── Arquitetura-TES-TSD.md    # Este documento
│   ├── API-Reference.md
│   └── Deployment-Guide.md
└── Topicos em Nuvem (Juliana))/
    ├── Cronograma-TES-v1.pdf
    ├── Graduação/
    └── Mestrado/
```

---

## Checklist de Implementação

### Fase 1: Decomposição do Monólito (Setembro)
- [ ] Criar estrutura de pastas dos 3 microsserviços
- [ ] Extrair lógica de Auth para portal-auth-service
- [ ] Extrair lógica de Destinos para destinos-core-service
- [ ] Criar analytics-service do zero
- [ ] Configurar bancos isolados
- [ ] Implementar comunicação HTTP síncrona
- [ ] Implementar comunicação assíncrona (fire-and-forget)
- [ ] Testar integração entre serviços

### Fase 2: Docker e Containerização (Outubro)
- [ ] Criar Dockerfiles otimizados para cada serviço
- [ ] Configurar docker-compose.yml
- [ ] Testar orquestração local
- [ ] Documentar processo de build

### Fase 3: Implantação AWS (Novembro)
- [ ] Configurar instâncias EC2
- [ ] Implantar serviços sem Docker (Trabalho 3.1 TES)
- [ ] Implantar com Docker (Trabalho 3.2 TES)
- [ ] Coletar métricas comparativas
- [ ] Escrever artigo comparativo

### Fase 4: Multi-Cloud (Novembro-Dezembro)
- [ ] Configurar Compute Engine no GCP
- [ ] Migrar Analytics para GCP
- [ ] Configurar Cloud Pub/Sub ou RabbitMQ
- [ ] Testar comunicação inter-cloud
- [ ] Executar testes de carga com k6
- [ ] Analisar latência e gargalos
- [ ] Escrever artigo final

---

*Documento gerado em 04/09/2026 para a disciplina de Tópicos em Nuvem (Profª Juliana Oliveira de Carvalho)*
