# 🎓 Pós-Graduação (TSD) — Multi-cloud

**Tópicos Avançados em Sistemas Distribuídos — Deploy em Múltiplos Provedores**

---

## 📊 Visão Geral

A fase de pós-graduação explora **multi-cloud**: usar mais de um provedor de nuvem ao mesmo tempo para estudar latência inter-cloud e vantagens de distribuição.

### Provedores Selecionados

| Provedor | Serviços Hospedados | Justificativa |
|----------|-------------------|---------------|
| **AWS** (Amazon) | Portal & Auth + Destinos Core | Mais próximo do usuário brasileiro |
| **GCP** (Google) | Analytics & Notification | Para estudar latência inter-cloud |
| **Azure** (Microsoft) | Serviços complementares | Para comparar serviços equivalentes |

---

## 🏗️ Arquitetura Multi-cloud

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

## 📂 Seções

### [AWS — Amazon Web Services](./aws/README.md)
- EC2 (Elastic Compute Cloud)
- ECS (Elastic Container Service)
- RDS (Relational Database Service)
- Configuração completa

### [GCP — Google Cloud Platform](./gcp/README.md)
- Compute Engine
- Cloud Pub/Sub
- Cloud Storage
- Configuração completa

### [Azure — Microsoft Azure](./azure/README.md)
- Virtual Machines
- Azure Container Instances
- Azure SQL Database
- Comparação com AWS/GCP

---

## 🎯 Objetivos da Fase TSD

1. **Multi-cloud real**: Deploy em AWS + GCP + Azure
2. **Comunicação assíncrona**: Message Broker entre provedores
3. **Testes de estresse**: k6 com cargas concorrentes
4. **Latência inter-cloud**: Medir overhead de comunicação entre provedores
5. **Artigo científico**: Experimentos e resultados

---

## 📋 Cronograma TSD

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

*Pós-Graduação (TSD) — Rotas Nordestinas 2026.2*
