# 🏗️ Arquitetura do Sistema

**Visão geral da arquitetura em microsserviços do Rotas Nordestinas**

---

## 📊 Resumo da Arquitetura

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

## 🎯 Princípios de Design

### 1. Bounded Contexts (Domain-Driven Design)
Cada microsserviço representa uma **capacidade de negócio** distinta:

| Serviço | Bounded Context | Responsabilidade |
|---------|-----------------|------------------|
| Portal & Auth | Interface + Identidade | Frontend, login, cadastro, perfil |
| Destinos Core | Conteúdo Turístico | CRUD cidades, comentários, favoritos |
| Analytics | Métricas + Alertas | Estatísticas, notificações |

### 2. Database per Service
Cada serviço possui seu **próprio banco de dados**:

```
Portal & Auth  →  PostgreSQL (rotas_auth_db)
Destinos Core  →  PostgreSQL (rotas_core_db)
Analytics      →  SQLite (rotas_analytics_db)
```

### 3. Comunicação
- **Síncrona** (HTTP/REST): Para dados que precisam aparecer na tela imediatamente
- **Assíncrona** (Pub/Sub): Para processamento em background

---

## 📂 Documentação Relacionada

- [Decomposição em Microsserviços](./bounded-contexts.md)
- [Padrões de Comunicação](./communication-patterns.md)
- [Do Monólito aos Microsserviços](./monolith-to-microservices.md)

---

*Visão geral da arquitetura — Rotas Nordestinas 2026.2*
