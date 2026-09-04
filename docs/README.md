# 📚 Rotas Nordestinas — Documentação

**Projeto:** Rotas Nordestinas — Plataforma de Turismo no Nordeste Brasileiro
**Instituição:** Universidade Federal do Piauí (UFPI) — 2026.2
**Docente:** Profª Dra. Juliana Oliveira de Carvalho

---

## 📂 Estrutura da Documentação

```
docs/
├── README.md                    # Este arquivo (índice principal)
├── architecture/                # Arquitetura do sistema
│   ├── README.md               # Visão geral da arquitetura
│   ├── monolith-to-microservices.md
│   ├── bounded-contexts.md
│   └── communication-patterns.md
├── master/                      # Pós-Graduação (TSD) — Multi-cloud
│   ├── README.md
│   ├── aws/                     # Amazon Web Services
│   ├── gcp/                     # Google Cloud Platform
│   └── azure/                   # Microsoft Azure
├── undergraduate/               # Graduação (TES) — Deploy na AWS
│   └── README.md
├── infrastructure/              # Infraestrutura e deploy
│   ├── README.md
│   ├── docker/
│   └── cloud-setup/
├── api/                         # Referência da API
│   └── README.md
├── testing/                     # Testes de carga
│   ├── README.md
│   ├── load-test.js
│   └── multi-cloud-test.js
└── guides/                      # Guias completos
    ├── rotas-nordestinas-complete.md
    └── healthcloud-proposal.md
```

---

## 🚀 Início Rápido

### Para entender o projeto
1. [Visão Geral da Arquitetura](./architecture/README.md)
2. [Decomposição em Microsserviços](./architecture/bounded-contexts.md)
3. [Comunicação entre Serviços](./architecture/communication-patterns.md)

### Para deploy (Graduação — TES)
1. [Guia de Deploy na AWS](./undergraduate/README.md)
2. [Docker e Containerização](./infrastructure/docker/README.md)
3. [Configuração de EC2](./infrastructure/cloud-setup/aws-ec2-setup.sh)

### Para multi-cloud (Pós-Graduação — TSD)
1. [Visão Geral Multi-cloud](./master/README.md)
2. [AWS — EC2/ECS](./master/aws/README.md)
3. [GCP — Compute Engine](./master/gcp/README.md)
4. [Azure — Serviços](./master/azure/README.md)

### Para testes
1. [Testes de Carga com k6](./testing/README.md)
2. [Teste Inter-Cloud](./testing/multi-cloud-test.js)

---

## 📋 Resumo do Projeto

| Aspecto | Descrição |
|---------|-----------|
| **Domínio** | Turismo no Nordeste Brasileiro |
| **Arquitetura** | Microsserviços (3 bounded contexts) |
| **Frontend** | Next.js 15 + React 19 + TypeScript |
| **Backend** | Node.js + Express + Prisma ORM |
| **Bancos** | PostgreSQL (Auth + Core) + SQLite (Analytics) |
| **Deploy (TES)** | AWS EC2 (puro) + Docker Compose |
| **Deploy (TSD)** | Multi-cloud: AWS + GCP + Azure |
| **Testes** | k6 para carga e latência inter-cloud |

---

## 🎓 Cronograma

### TES (Graduação)
| Data | Entrega |
|------|---------|
| 15/09/2026 | Artigo Survey — Cloud services |
| 20/10/2026 | Artigo Survey — Virtualização e containers |
| 27/10/2026 | Entrega parcial — 30% da aplicação |
| 17/11/2026 | Deploy na AWS **sem Docker** (EC2 puro) |
| 01/12/2026 | Deploy na AWS **com Docker** |
| 08/12/2026 | Artigo comparativo: EC2 vs Docker |

### TSD (Pós-Graduação)
| Data | Entrega |
|------|---------|
| 02/10/2026 | Artigo Survey |
| 16/10/2026 | Artigo Survey |
| 16/11/2026 | App na AWS + GCP (multi-cloud) |
| 23/11/2026 | App com Docker na AWS |
| 16/11/2026 | Microsserviços em múltiplos provedores **sem containers** |
| 23/11/2026 | Microsserviços em múltiplos provedores **com containers** |
| 11/12/2026 | Artigo final com experimentos |

---

*Documentação organizada em 04/09/2026 seguindo princípios de Clean Code*
