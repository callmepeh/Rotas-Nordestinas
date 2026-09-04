# 🏗️ Infraestrutura

**Configuração de containers, deploy e cloud setup**

---

## 📂 Estrutura

```
infrastructure/
├── README.md                    # Este arquivo
├── docker/
│   ├── README.md               # Guia de containers
│   ├── docker-compose.yml      # Composição principal
│   ├── docker-compose.prod.yml # Produção
│   ├── portal-auth.Dockerfile
│   ├── destinos-core.Dockerfile
│   └── analytics.Dockerfile
└── cloud-setup/
    ├── aws-ec2-setup.sh        # Setup automatizado AWS
    └── gcp-compute-setup.sh    # Setup automatizado GCP
```

---

## 🐳 Docker

### Visão Geral

Cada microsserviço é empacotado como um container Docker isolado, com seu próprio banco de dados.

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ portal-auth  │  │ destinos-core│  │ analytics    │     │
│  │ Port: 3000   │  │ Port: 3001   │  │ Port: 3002   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│  ┌──────▼───────┐  ┌─────▼────────┐  ┌────▼────┐        │
│  │   auth-db    │  │   core-db    │  │ SQLite  │        │
│  │ (PostgreSQL) │  │ (PostgreSQL) │  │ (local) │        │
│  └──────────────┘  └──────────────┘  └─────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Comandos Úteis

```bash
# Subir todos os containers
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar todos
docker-compose down

# Rebuild
docker-compose build --no-cache

# Acessar container
docker exec -it rotas-portal-auth sh
```

---

## ☁️ Cloud Setup

### Scripts de Setup

| Script | Provedor | Uso |
|--------|----------|-----|
| `aws-ec2-setup.sh` | AWS | Configura instância EC2 automaticamente |
| `gcp-compute-setup.sh` | GCP | Configura Compute Engine automaticamente |

### Uso

```bash
# AWS
chmod +x cloud-setup/aws-ec2-setup.sh
./cloud-setup/aws-ec2-setup.sh

# GCP
chmod +x cloud-setup/gcp-compute-setup.sh
./cloud-setup/gcp-compute-setup.sh
```

---

## 🔐 Variáveis de Ambiente

### Arquivo .env

```bash
# Banco de Dados Auth
AUTH_DB_PASSWORD=sua-senha-segura

# Banco de Dados Core
CORE_DB_PASSWORD=sua-senha-segura

# JWT
JWT_SECRET=seu-jwt-secret-muito-seguro
JWT_EXPIRES_IN=7d

# URLs dos Serviços
DESTINOS_CORE_URL=http://destinos-core:3001
ANALYTICS_URL=http://analytics:3002

# Supabase (se usando)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 📋 Checklist de Infraestrutura

- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Containers buildados
- [ ] Containers rodando
- [ ] Bancos de dados acessíveis
- [ ] Comunicação entre serviços testada
- [ ] Logs configurados
- [ ] Monitoramento ativo

---

*Infraestrutura — Rotas Nordestinas 2026.2*
