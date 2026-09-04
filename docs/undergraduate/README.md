# 🎓 Graduação (TES) — Deploy na AWS

**Tópicos Especiais em Engenharia de Software — Deploy em Nuvem**

---

## 📊 Visão Geral

A fase de graduação foca em deploy na **AWS** (Amazon Web Services), nas modalidades:
1. **Sem Docker** (EC2 puro) — Trabalho 3.1
2. **Com Docker** (Docker Compose) — Trabalho 3.2
3. **Artigo Comparativo** — Trabalho 3.3

---

## 🏗️ Arquitetura de Deploy

### Fase 1: EC2 Puro (Sem Docker)

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS                                  │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  EC2 #1          │  │  EC2 #2          │               │
│  │  Portal & Auth   │  │  Destinos Core   │               │
│  │  (Node.js + PM2) │  │  (Node.js + PM2) │               │
│  │  Porta: 3000     │  │  Porta: 3001     │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
│           │                     │                          │
│  ┌────────▼─────────────────────▼─────────┐               │
│  │              EC2 #3                     │               │
│  │         Analytics Service               │               │
│  │         (Node.js + PM2)                 │               │
│  │         Porta: 3002                     │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  ┌──────────────────┐                                      │
│  │  EC2 #4 ou RDS   │ ← Banco PostgreSQL                  │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Fase 2: Docker Compose

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS (1 EC2)                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Docker Compose                       │   │
│  │                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │   │
│  │  │ portal-auth  │  │ destinos-core│  │ analytics │ │   │
│  │  │ (Container)  │  │ (Container)  │  │(Container)│ │   │
│  │  │ Port: 3000   │  │ Port: 3001   │  │Port: 3002 │ │   │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │   │
│  │         │                 │                 │       │   │
│  │  ┌──────▼───────┐  ┌─────▼────────┐  ┌────▼────┐  │   │
│  │  │   auth-db    │  │   core-db    │  │ SQLite  │  │   │
│  │  │ (PostgreSQL) │  │ (PostgreSQL) │  │ (local) │  │   │
│  │  └──────────────┘  └──────────────┘  └─────────┘  │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Trabalho 3.1: EC2 Puro

### Passo a Passo

1. **Criar 3 instâncias EC2**
   - Portal & Auth: t3.small
   - Destinos Core: t3.small
   - Analytics: t3.micro

2. **Configurar Security Groups**
   ```bash
   # Portas necessárias
   - SSH (22): Seu IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - 3000: 0.0.0.0/0 (Portal)
   - 3001: 0.0.0.0/0 (Core)
   - 3002: 0.0.0.0/0 (Analytics)
   ```

3. **Instalar dependências em cada instância**
   ```bash
   sudo yum update -y
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs git
   sudo npm install -g pm2
   ```

4. **Clonar e configurar projeto**
   ```bash
   git clone https://github.com/seu-usuario/rotas-nordestinas.git
   cd rotas-nordestinas
   npm install
   cp .env.example .env
   # Editar .env com variáveis corretas
   npm run build
   ```

5. **Iniciar com PM2**
   ```bash
   pm2 start npm --name "portal-auth" -- start
   pm2 start npm --name "destinos-core" -- start
   pm2 start npm --name "analytics" -- start
   pm2 save
   pm2 startup
   ```

6. **Configurar Nginx**
   ```bash
   sudo yum install -y nginx
   sudo nano /etc/nginx/conf.d/rotas.conf
   ```

### Métricas a Coletar

```bash
# CPU e Memória
htop

# Tempo de resposta
ab -n 1000 -c 50 http://<ec2-ip>/api/cidades
wrk -t4 -c100 -d30s http://<ec2-ip>/api/cidades
```

---

## 📋 Trabalho 3.2: Docker Compose

### Passo a Passo

1. **Criar 1 instância EC2 (maior)**
   - Tipo: t3.medium (2 vCPU, 4GB RAM)
   - Storage: 30GB

2. **Instalar Docker**
   ```bash
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ec2-user
   
   # Instalar Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clonar e subir containers**
   ```bash
   git clone https://github.com/seu-usuario/rotas-nordestinas.git
   cd rotas-nordestinas/infra
   
   # Criar arquivo .env
   cp .env.example .env
   # Editar variáveis
   
   # Subir containers
   docker-compose up -d
   
   # Verificar
   docker-compose ps
   docker-compose logs -f
   ```

4. **Configurar Nginx**
   ```bash
   sudo yum install -y nginx
   # Configurar reverse proxy para container na porta 3000
   ```

### Métricas a Coletar

```bash
# Recursos por container
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Tempo de resposta
ab -n 1000 -c 50 http://<ec2-ip>/api/cidades
```

---

## 📋 Trabalho 3.3: Artigo Comparativo

### Estrutura do Artigo

1. **Introdução**
   - Contexto do projeto
   - Objetivo da comparação

2. **Metodologia**
   - Ambiente de teste
   - Ferramentas utilizadas
   - Métricas coletadas

3. **Resultados**
   - EC2 puro vs Docker
   - Consumo de recursos
   - Tempo de resposta
   - Facilidade de deploy

4. **Discussão**
   - Vantagens e desvantagens
   - Quando usar cada abordagem

5. **Conclusão**
   - Recomendações

### Métricas a Comparar

| Métrica | EC2 Puro | Docker Compose |
|---------|----------|----------------|
| CPU médio | ? | ? |
| Memória média | ? | ? |
| Tempo de resposta (p95) | ? | ? |
| Tempo de deploy | ? | ? |
| Facilidade de manutenção | ? | ? |

---

## 📊 Cronograma TES

| Data | Entrega |
|------|---------|
| 15/09/2026 | Artigo Survey — Cloud services |
| 20/10/2026 | Artigo Survey — Virtualização e containers |
| 27/10/2026 | Entrega parcial — 30% da aplicação |
| 17/11/2026 | Deploy na AWS **sem Docker** (EC2 puro) |
| 01/12/2026 | Deploy na AWS **com Docker** |
| 08/12/2026 | Artigo comparativo: EC2 vs Docker |

---

*Graduação (TES) — Rotas Nordestinas 2026.2*
