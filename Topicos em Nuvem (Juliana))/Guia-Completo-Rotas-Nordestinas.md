# 🗺️ Rotas Nordestinas — Guia Completo do Projeto

**Projeto:** Rotas Nordestinas — Plataforma de Turismo no Nordeste Brasileiro  
**Disciplina:** TES (Graduação) + TSD (Pós-Graduação)  
**Docente:** Profª Dra. Juliana Oliveira de Carvalho  
**Instituição:** Universidade Federal do Piauí (UFPI) — 2026.2

---

## 📑 Sumário

1. [O que é o Rotas Nordestinas?](#1-o-que-é-o-rotas-nordestinas)
2. [Como a Aplicação é Usada (Visão do Usuário)](#2-como-a-aplicação-é-usada)
3. [A Arquitetura: De Monólito a Microsserviços](#3-a-arquitetura)
4. [Os 3 Microsserviços em Detalhe](#4-os-3-microsserviços)
5. [Como os Serviços se Comunicam](#5-comunicação-entre-serviços)
6. [Banco de Dados: Um Banco por Serviço](#6-banco-de-dados)
7. [Deploy: AWS e Multi-Cloud com GCP](#7-deploy)
8. [Testes de Carga e Métricas](#8-testes-de-carga)
9. [Cronograma de Entregas](#9-cronograma)

---

## 1. O que é o Rotas Nordestinas?

O **Rotas Nordestinas** é uma plataforma web que ajuda pessoas a descobrir e planejar viagens pelo Nordeste brasileiro. Pense nisso como um "Guia de Turismo Digital" focado nas 9 estados do Nordeste: Ceará, Pernambuco, Bahia, Rio Grande do Norte, Paraíba, Alagoas, Sergipe, Piauí e Maranhão.

### O que o usuário pode fazer?

| Funcionalidade | Descrição |
|---------------|-----------|
| 🏙️ **Explorar Cidades** | Ver todas as cidades do Nordeste com fotos, descrições e coordenadas no mapa |
| 📍 **Pontos Turísticos** | Descobrir praias, museus, parques e atrações de cada cidade |
| ✈️ **Como Chegar** | Ver opções de transporte (terrestre, aéreo, marítimo) para chegar a cada destino |
| 🎯 **Atividades** | Conhecer as atividades disponíveis: trilhas, passeios, festas, gastronomia |
| 💡 **Dicas** | Receber dicas de viagem: melhor época, o que levar, onde comer |
| 💬 **Comentários** | Compartilhar experiências e ler feedbacks de outros viajantes |
| ❤️ **Favoritos** | Salvar cidades favoritas para consultar depois |
| 🗺️ **Mapa Interativo** | Visualizar todos os destinos em um mapa usando Leaflet |
| ✍️ **Sugerir Rota** | Enviar sugestões de novas cidades para o administrador aprovar |
| 👤 **Perfil** | Gerenciar dados pessoais e ver histórico de interações |

### Fluxo típico de uso

```
1. Usuário abre o site
   ↓
2. Vê a página inicial com os destinos em destaque
   ↓
3. Clica em uma cidade (ex: "Fortaleza")
   ↓
4. Vê detalhes: pontos turísticos, como chegar, atividades, dicas
   ↓
5. Lê comentários de outros usuários
   ↓
6. Adiciona aos favoritos ❤️
   ↓
7. Deixa um comentário sobre a experiência
   ↓
8. (Opcional) Sugere uma nova cidade para o catálogo
```

---

## 2. Como a Aplicação é Usada

### 2.1 Páginas do Frontend

```
┌─────────────────────────────────────────────────────────┐
│                    ROTAS NORDESTINAS                     │
├─────────────────────────────────────────────────────────┤
│  🏠 Home          → Destinos em destaque, busca       │
│  🗺️ Destinos      → Lista completa de cidades         │
│  📍 Detalhe       → Informações de uma cidade         │
│  ❤️ Favoritos     → Cidades salvas pelo usuário       │
│  ✍️ Sugerir Rota  → Formulário de submissão           │
│  👤 Perfil        → Dados do usuário                  │
│  🔐 Login/Cadastro→ Autenticação                      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Fluxos Principais

#### Fluxo 1: Explorar Destinos
```
Usuário → Página Inicial → Clica em cidade → Vê detalhes
                                              ├── Pontos Turísticos
                                              ├── Como Chegar
                                              ├── Atividades
                                              ├── Dicas
                                              └── Comentários
```

#### Fluxo 2: Autenticação
```
Usuário → Clica "Entrar" → Login (email + senha) → Token JWT salvo
    ↓
Usuário → Clica "Cadastrar" → Preenche dados → Conta criada → Login automático
```

#### Fluxo 3: Interação (Comentários e Favoritos)
```
Usuário autenticado → Clica "Favoritar" → Cidade salva
Usuário autenticado → Escreve comentário → Comentário publicado
```

#### Fluxo 4: Sugestão de Rota
```
Usuário → Página "Sugerir Rota" → Preenche formulário
    ↓
Envia para administração → Status: "pendente"
    ↓
Admin aprova → Cidade é publicada no catálogo
    ↓
Usuário recebe notificação de aprovação
```

---

## 3. A Arquitetura

### 3.1 O que é um Monólito?

O projeto **atualmente** é um **monólito**: tudo está junto em um único programa.

```
┌─────────────────────────────────────────────┐
│              MONÓLITO (atual)               │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Frontend │  │ API      │  │ Banco de  │  │
│  │ (React)  │  │ Routes   │  │ Dados     │  │
│  │          │  │ (Tudo    │  │ (Tudo     │  │
│  │ Páginas  │  │ junto)   │  │ junto)    │  │
│  │ Component│  │ Auth     │  │ Users     │  │
│  │ Mapas    │  │ Cidades  │  │ Cidades   │  │
│  │          │  │ Coment.  │  │ Coment.   │  │
│  │          │  │ Favoritos│  │ Favoritos │  │
│  └─────────┘  └──────────┘  └───────────┘  │
│                                             │
│  Tudo roda em UM processo (Next.js)         │
│  Tudo acessa UM banco (Supabase/PostgreSQL) │
└─────────────────────────────────────────────┘
```

**Problemas do monólito:**
- Se uma parte quebra, tudo quebra
- Difícil de escalar partes específicas
- Difícil de atualizar sem parar tudo
- Não atende aos requisitos da disciplina

### 3.2 O que são Microsserviços?

A disciplina exige que transformemos o monólito em **microsserviços**: dividir o sistema em partes menores, independentes, cada uma fazendo uma coisa bem feita.

```
┌─────────────────────────────────────────────────────────────┐
│                    MICROSSERVIÇOS                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Serviço 1    │  │ Serviço 2    │  │ Serviço 3    │     │
│  │ Portal & Auth│  │ Destinos Core│  │ Analytics    │     │
│  │              │  │              │  │              │     │
│  │ Frontend     │  │ CRUD Cidades │  │ Métricas     │     │
│  │ Login        │  │ Comentários  │  │ Notificações │     │
│  │ Perfil       │  │ Favoritos    │  │ Dashboard    │     │
│  │              │  │ Sugestões    │  │              │     │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │     │
│  │ │ DB Auth  │ │  │ │ DB Core  │ │  │ │ DB Ana-  │ │     │
│  │ │(Postgres)│ │  │ │(Postgres)│ │  │ │lytics    │ │     │
│  │ └──────────┘ │  │ └──────────┘ │  │ │(SQLite)  │ │     │
│  └──────────────┘  └──────────────┘  │ └──────────┘ │     │
│                                      └──────────────┘     │
│        AWS                 AWS               GCP            │
└─────────────────────────────────────────────────────────────┘
```

**Vantagens dos microsserviços:**
- Se um serviço quebra, os outros continuam funcionando
- Cada serviço pode escalar independentemente
- Cada serviço pode ser atualizado sem parar o sistema
- Cada serviço pode usar a tecnologia ideal para sua função
- Atende perfeitamente aos requisitos da disciplina

### 3.3 Por que 3 Microsserviços?

A professora Juliana propôs um projeto chamado **HealthCloud** (plataforma de saúde) com exatamente 3 microsserviços. Nós adaptamos essa arquitetura para o nosso domínio de turismo:

| HealthCloud (Proposta da Professora) | Rotas Nordestinas (Nosso Projeto) |
|--------------------------------------|-----------------------------------|
| Portal & Auth Service | **Portal & Auth Service** (mesmo conceito) |
| Clinical Core Service | **Destinos Core Service** (adaptado para turismo) |
| Analytics & Alert Service | **Analytics & Notification Service** (adaptado) |

A divisão em 3 segue o princípio de **Bounded Contexts** do Domain-Driven Design: cada serviço representa uma "capacidade de negócio" distinta.

---

## 4. Os 3 Microsserviços em Detalhe

### 🔐 Microsserviço 1: Portal & Auth Service

**O que faz:** É a "porta de entrada" da aplicação. Cuida da interface visual (o que o usuário vê) e da identidade (login, cadastro, perfil).

**Analogia:** É como o "receptionista" de um hotel — recebe o hóspede, verifica sua identidade e encaminha para os serviços certos.

```
┌─────────────────────────────────────────────┐
│         PORTAL & AUTH SERVICE                │
│                                             │
│  O que ele faz:                             │
│  ✅ Mostra o site (frontend Next.js)        │
│  ✅ Gerencia login e cadastro               │
│  ✅ Gera tokens JWT (senhas digitais)       │
│  ✅ Gerencia perfis de usuário              │
│  ✅ Verifica se o usuário está autenticado  │
│                                             │
│  Banco de Dados (PostgreSQL):               │
│  📋 Tabela Users:                           │
│     - id (UUID)                             │
│     - email                                 │
│     - nomeCompleto                          │
│     - funcao (usuario/admin/colaborador)    │
│     - telefone, dataNascimento, etc.        │
│                                             │
│  Tecnologias:                               │
│  🟢 Next.js 15 + React 19                   │
│  🟢 TypeScript                              │
│  🟢 JWT (jsonwebtoken)                      │
│  🟢 Prisma ORM                              │
│                                             │
│  Porta: 3000                                │
│  Provedor: AWS (EC2 / ECS)                  │
└─────────────────────────────────────────────┘
```

**Endpoints:**
```
POST /api/auth/register  → Cadastro de novo usuário
POST /api/auth/login     → Login (retorna JWT)
GET  /api/auth/me        → Dados do usuário logado
PUT  /api/auth/update/:id → Atualizar perfil
```

---

### 🏙️ Microsserviço 2: Destinos Core Service

**O que faz:** É o "coração" do sistema. Gerencia todo o conteúdo turístico: cidades, pontos turísticos, rotas de acesso, atividades, dicas, comentários e favoritos.

**Analogia:** É como o "departamento de turismo" de um município — cuida de todas as informações sobre os destinos.

```
┌─────────────────────────────────────────────┐
│         DESTINOS CORE SERVICE                │
│                                             │
│  O que ele faz:                             │
│  ✅ CRUD de Cidades (criar, ler, atualizar, │
│     deletar)                                │
│  ✅ Pontos Turísticos de cada cidade        │
│  ✅ Informações "Como Chegar"               │
│  ✅ Atividades disponíveis                  │
│  ✅ Dicas de viagem                         │
│  ✅ Sistema de Comentários                  │
│  ✅ Sistema de Favoritos                    │
│  ✅ Fluxo de Sugestões de Rota              │
│                                             │
│  Banco de Dados (PostgreSQL):               │
│  📋 Tabelas:                                │
│     - Cidades                               │
│     - Pontos_Turisticos                     │
│     - Como_Chegar                           │
│     - Atividades                            │
│     - Dicas                                 │
│     - Comentarios                           │
│     - Favoritos                             │
│     - Sugestoes_de_Rota                     │
│     - Estados                               │
│                                             │
│  Tecnologias:                               │
│  🟢 Node.js + Express                       │
│  🟢 TypeScript                              │
│  🟢 Prisma ORM                              │
│  🟢 PostgreSQL                              │
│                                             │
│  Porta: 3001                                │
│  Provedor: AWS (EC2 / ECS / RDS)            │
└─────────────────────────────────────────────┘
```

**Endpoints principais:**
```
GET    /api/cidades                    → Listar todas as cidades
GET    /api/cidades/:id                → Detalhes de uma cidade
GET    /api/cidades/buscar?q=fortaleza → Buscar por nome
POST   /api/cidades                    → Criar cidade (admin)
GET    /api/pontos/:cidadeId           → Pontos turísticos
GET    /api/como-chegar/:cidadeId      → Como chegar
GET    /api/atividades/:cidadeId       → Atividades
GET    /api/dicas/:cidadeId            → Dicas
GET    /api/comentarios/por-cidade/:id → Comentários
POST   /api/comentarios                → Criar comentário
POST   /api/favoritos/add              → Adicionar favorito
POST   /api/favoritos/remove           → Remover favorito
POST   /api/sugerir                    → Submeter sugestão
```

---

### 📊 Microsserviço 3: Analytics & Notification Service

**O que faz:** Coleta dados de uso da plataforma, calcula métricas e envia notificações. É como um "assistente inteligente" que observa tudo e gera relatórios.

**Analogia:** É como o "departamento de estatísticas" de uma empresa — monitora o que os usuários fazem e gera insights.

```
┌─────────────────────────────────────────────┐
│      ANALYTICS & NOTIFICATION SERVICE       │
│                                             │
│  O que ele faz:                             │
│  ✅ Registra cada acesso/interação          │
│  ✅ Calcula destinos mais populares         │
│  ✅ Métricas de engajamento                 │
│  ✅ Dashboard de estatísticas (admin)       │
│  ✅ Notifica quando sugestão é aprovada     │
│  ✅ Alertas de atividade suspeita           │
│                                             │
│  Banco de Dados (SQLite):                   │
│  📋 Tabelas:                                │
│     - AccessLogs (logs de acesso)           │
│     - DestinoMetrics (métricas por cidade)  │
│     - Notifications (notificações)          │
│     - AlertRules (regras de alerta)         │
│                                             │
│  Tecnologias:                               │
│  🟢 Node.js + Express                       │
│  🟢 SQLite (rápido e local)                 │
│  🟢 Bull Queue (processamento assíncrono)   │
│                                             │
│  Porta: 3002                                │
│  Provedor: GCP (Compute Engine)             │
│  ↑↑↑ NO PROVEDOR DIFERENTE (multi-cloud) ↑↑↑│
└─────────────────────────────────────────────┘
```

**Endpoints:**
```
POST /api/analytics/event          → Registrar evento
GET  /api/analytics/metrics/:id    → Métricas de uma cidade
GET  /api/analytics/popular        → Top destinos populares
GET  /api/analytics/dashboard      → Dashboard admin
GET  /api/notifications/:userId    → Notificações do usuário
POST /api/notifications/mark-read  → Marcar como lida
```

---

## 5. Comunicação entre Serviços

### 5.1 Comunicação Síncrona (mesmo tempo)

Usada quando o usuário precisa ver o resultado **agora**. O Portal faz uma pergunta ao Destinos Core e espera a resposta.

```
Exemplo: Usuário clica em "Fortaleza"

Portal & Auth ──── "Quais os detalhes de Fortaleza?" ────► Destinos Core
                                                                    │
Portal & Auth ◄─── "{ nome: 'Fortaleza', pontos: [...] }" ────────┘
     │
     ▼
Usuário vê os dados na tela
```

**Quando usar:** Listar cidades, buscar detalhes, criar comentários, gerenciar favoritos.

---

### 5.2 Comunicação Assíncrona (desacoplada)

Usada quando o resultado **não precisa ser imediato**. O Destinos Core avisa o Analytics que algo aconteceu, mas não espera a resposta.

```
Exemplo: Usuário adicionou um favorito

Destinos Core ──── "Favorito adicionado!" ────► Analytics Service
      │                                              │
      ▼                                              ▼
Resposta imediata ao usuário              Processa em background
"Favorito salvo com sucesso"              Atualiza métricas
                                          Envia notificação se necessário
```

**Quando usar:** Registrar acessos, atualizar métricas, enviar notificações.

---

### 5.3 Fluxo Completo de uma Requisição

```
Usuário clica em "Fortaleza"
         │
         ▼
┌─────────────────┐
│ Portal & Auth   │ ← Recebe request do browser
│ (AWS)           │
└────────┬────────┘
         │ HTTP/REST síncrono
         ▼
┌─────────────────┐
│ Destinos Core   │ ← Busca dados no banco
│ (AWS)           │
└────────┬────────┘
         │ HTTP/REST assíncrono (fire-and-forget)
         ▼
┌─────────────────┐
│ Analytics       │ ← Registra: "Fortaleza foi acessada"
│ (GCP)           │    Atualiza métricas de popularity
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Resposta volta  │ ← Dados de Fortaleza exibidos
│ ao Portal       │    ao usuário em < 200ms
└─────────────────┘
```

---

## 6. Banco de Dados

### Regra Fundamental: Database per Service

Cada microsserviço tem seu **próprio banco de dados**. Nenhum serviço acessa o banco de outro.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Portal &    │     │ Destinos    │     │ Analytics   │
│ Auth        │     │ Core        │     │             │
│             │     │             │     │             │
│ Acessa SOMENTE│   │ Acessa SOMENTE│  │ Acessa SOMENTE│
│ seu banco   │     │ seu banco   │     │ seu banco   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ rotas_auth  │     │ rotas_core  │     │ rotas_      │
│ _db         │     │ _db         │     │ analytics_db│
│ (PostgreSQL)│     │ (PostgreSQL)│     │ (SQLite)    │
│             │     │             │     │             │
│ • Users     │     │ • Cidades   │     │ • AccessLogs│
│             │     │ • Pontos    │     │ • Metrics   │
│             │     │ • Coment.   │     │ • Notifs    │
│             │     │ • Favoritos │     │ • Alerts    │
│             │     │ • Sugestões │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Por que separar os bancos?

| Benefício | Explicação |
|-----------|-----------|
| **Isolamento** | Se o banco do Analytics cair, o Portal e os Destinos continuam funcionando |
| **Escalabilidade** | O banco de Cidades pode crescer mais que o de Auth |
| **Segurança** | Dados sensíveis (senhas) ficam isolados do conteúdo público |
| **Flexibilidade** | Cada serviço usa o tipo de banco ideal (PostgreSQL para dados relacionais, SQLite para métricas rápidas) |

---

## 7. Deploy

### 7.1 Fase Mononuvem (TES — Graduação)

Tudo roda na **AWS** (Amazon Web Services).

```
                    ┌─────────────┐
                    │   Usuário   │
                    │  (Browser)  │
                    └──────┬──────┘
                           │ HTTPS
              ╔════════════▼════════════╗
              ║         AWS             ║
              ║                         ║
              ║  ┌──────────────────┐   ║
              ║  │   Portal & Auth  │   ║
              ║  │   (EC2 #1)       │   ║
              ║  └────────┬─────────┘   ║
              ║           │             ║
              ║  ┌────────▼─────────┐   ║
              ║  │  Destinos Core   │   ║
              ║  │  (EC2 #2)        │   ║
              ║  └────────┬─────────┘   ║
              ║           │             ║
              ║  ┌────────▼─────────┐   ║
              ║  │  Analytics       │   ║
              ║  │  (EC2 #3)        │   ║
              ║  └──────────────────┘   ║
              ║                         ║
              ║  ┌──────────────────┐   ║
              ║  │  PostgreSQL      │   ║
              ║  │  (RDS ou EC2 #4) │   ║
              ║  └──────────────────┘   ║
              ╚═════════════════════════╝
```

**Duas formas de deploy na AWS:**

| Modalidade | Descrição | Trabalho |
|-----------|-----------|----------|
| **Sem Docker** | Cada serviço roda direto no EC2 com PM2 | Trabalho 3.1 (TES) |
| **Com Docker** | Cada serviço é um container, orquestrado com Docker Compose | Trabalho 3.2 (TES) |

---

### 7.2 Fase Multinuvem (TSD — Pós-Graduação)

O Analytics migra para o **GCP** (Google Cloud Platform), criando o cenário multi-cloud.

```
                    ┌─────────────┐
                    │   Usuário   │
                    │  (Browser)  │
                    └──────┬──────┘
                           │ HTTPS
              ╔════════════▼════════════╗
              ║         AWS             ║
              ║  ┌──────────────────┐   ║
              ║  │   Portal & Auth  │   ║
              ║  └────────┬─────────┘   ║
              ║           │             ║
              ║  ┌────────▼─────────┐   ║
              ║  │  Destinos Core   │   ║
              ║  └────────┬─────────┘   ║
              ╚═══════════╪═════════════╝
                          │
                    Cloud Pub/Sub
                    (ou RabbitMQ)
                          │
              ╔═══════════╪═════════════╗
              ║    GCP    │             ║
              ║  ┌────────▼─────────┐   ║
              ║  │  Analytics       │   ║
              ║  │  (Compute Engine)│   ║
              ║  └──────────────────┘   ║
              ╚═════════════════════════╝

     Latência inter-cloud: 50-200ms
     (isso é o que vamos medir e comparar!)
```

### 7.3 O que é Multi-Cloud?

**Multi-cloud** significa usar mais de um provedor de nuvem ao mesmo tempo. Neste projeto:

| Provedor | Serviços Hospedados | Por quê? |
|----------|-------------------|----------|
| **AWS** (Amazon) | Portal & Auth + Destinos Core | Mais próximo do usuário brasileiro |
| **GCP** (Google) | Analytics & Notification | Para estudar latência inter-cloud |

**O que queremos demonstrar:**
- Como a comunicação entre provedores diferentes afeta o desempenho
- Quanto tempo leva para uma mensagem viajar da AWS para o GCP
- Se a diferença de latência é perceptível pelo usuário
- Como o Message Broker (RabbitMQ/Pub/Sub) garante entrega confiável entre provedores

---

## 8. Testes de Carga

### 8.1 Por que testar carga?

A disciplina exige que façamos **testes de estresse** para medir como o sistema se comporta com muitos usuários simultâneos.

### 8.2 Ferramenta: k6

O **k6** é uma ferramenta open-source para testes de carga. Simula centenas de usuários acessando o sistema ao mesmo tempo.

```
Cenário de teste:

  10 usuários  ─────►  50  ─────►  100  ─────►  200  ─────►  500
  (30s)              (1min)       (2min)        (2min)       (30s)
  
  ┌──────────────────────────────────────────────────────────┐
  │              Carga progressiva de 10 a 500               │
  │              requisições por segundo                     │
  └──────────────────────────────────────────────────────────┘
```

### 8.3 Métricas Coletadas

| Métrica | O que mede | Meta |
|---------|-----------|------|
| **Latência média** | Tempo médio de resposta | < 200ms |
| **p50 (mediana)** | 50% das respostas são mais rápidas que isso | < 200ms |
| **p95** | 95% das respostas são mais rápidas que isso | < 500ms |
| **p99** | 99% das respostas são mais rápidas que isso | < 1000ms |
| **Taxa de erro** | % de requisições que falharam | < 5% |
| **Throughput** | Requisições processadas por segundo | Maximizar |

### 8.4 Comparação que queremos fazer

```
Cenário 1: AWS → AWS (mesma nuvem)
  Portal ──── 50ms ────► Core
  Core ────── 30ms ────► Analytics (AWS)

Cenário 2: AWS → GCP (multi-cloud)
  Portal ──── 50ms ────► Core
  Core ────── 150ms ───► Analytics (GCP)
                          ↑↑↑ 100ms a mais! ↑↑↑

Resultado esperado:
  AWS → AWS:  p95 < 200ms
  AWS → GCP:  p95 < 500ms
  Diferença:  ~100-200ms de overhead inter-cloud
```

---

## 9. Cronograma de Entregas

### 📚 TES (Graduação — Tópicos Especiais em Eng. de Software)

| Data | O que entregar | Nota |
|------|---------------|------|
| **15/09/2026** | Artigo Survey — Comparar serviços cloud (AWS vs outro) | 5.00 |
| **20/10/2026** | Artigo Survey — Virtualização e containers | 5.00 |
| **27/10/2026** | Entrega parcial — 30% da aplicação | - |
| **17/11/2026** | 🖥️ Aplicação rodando na AWS **sem Docker** (EC2 puro) | 3.00 |
| **01/12/2026** | 🐳 Aplicação rodando na AWS **com Docker** | 3.00 |
| **08/12/2026** | 📄 Artigo comparativo: EC2 puro vs Docker | 4.00 |

### 🎓 TSD (Pós-Graduação — Tópicos Avançados em Sistemas Distribuídos)

| Data | O que entregar | Nota |
|------|---------------|------|
| **02/10/2026** | Artigo Survey | 5.00 |
| **16/10/2026** | Artigo Survey | 5.00 |
| **16/11/2026** | 🌐 App implantada na AWS + GCP (multi-cloud) | 2.50 |
| **23/11/2026** | 🐳 App com Docker na AWS | 2.50 |
| **16/11/2026** | 🖥️ Microsserviços em múltiplos provedores **sem containers** | 5.00 |
| **23/11/2026** | 🐳 Microsserviços em múltiplos provedores **com containers** | 5.00 |
| **11/12/2026** | 📄 Artigo final com experimentos de acessos simultâneos | - |

---

## 📋 Resumo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                  ROTAS NORDESTINAS                          │
│              Arquitetura em Microsserviços                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐   HTTP/REST   ┌──────────┐  Pub/Sub  ┌──────┐│
│  │ Portal   │◄─────────────►│ Destinos │◄─────────►│Analyt││
│  │ & Auth   │   (síncrono)  │  Core    │ (assínc.) │ics   ││
│  │          │               │          │           │      ││
│  │ Next.js  │               │ Express  │           │Node  ││
│  │ JWT      │               │ Prisma   │           │SQLite││
│  └────┬─────┘               └────┬─────┘           └──┬───┘│
│       │                          │                    │    │
│  ┌────▼─────┐               ┌────▼─────┐           ┌──▼───┐│
│  │PostgreSQL│               │PostgreSQL│           │SQLite││
│  │ (Auth DB)│               │ (Core DB)│           │      ││
│  └──────────┘               └──────────┘           └──────┘│
│                                                             │
│       AWS                    AWS                     GCP    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TES: Deploy na AWS (EC2 + Docker)                   │   │
│  │ TSD: Multi-cloud (AWS + GCP) + k6 load tests       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

*Guia gerado em 04/09/2026 para a disciplina de Tópicos em Nuvem (Profª Juliana Oliveira de Carvalho — UFPI)*
