# ☁️ AWS — Amazon Web Services

**Configuração e deploy dos microsserviços na AWS**

---

## 📊 Serviços Utilizados

| Serviço | Nome Completo | Uso no Projeto |
|---------|---------------|----------------|
| **EC2** | Elastic Compute Cloud | Servidores virtuais para Portal & Auth e Destinos Core |
| **ECS** | Elastic Container Service | Orquestração de containers (alternativa ao EC2) |
| **RDS** | Relational Database Service | Bancos de dados PostgreSQL gerenciados |
| **S3** | Simple Storage Service | Armazenamento de imagens e estáticos |
| **CloudFront** | CDN | Distribuição de conteúdo estático |
| **Route 53** | DNS | Gerenciamento de domínio |

---

## 🏗️ Arquitetura na AWS

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS                                  │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Portal & Auth   │    │  Destinos Core   │              │
│  │  (EC2 #1)        │    │  (EC2 #2)        │              │
│  │  Porta: 3000     │    │  Porta: 3001     │              │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       │                                     │
│  ┌──────────────────▼──────────────────┐                   │
│  │         RDS PostgreSQL              │                   │
│  │  rotas_auth_db + rotas_core_db      │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ┌──────────────────┐                                      │
│  │  S3 Bucket       │ ← Imagens dos destinos              │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Completo

### 1. Criar Instância EC2

```bash
# Acessar AWS Console → EC2 → Launch Instance

# Configurações recomendadas:
# - AMI: Amazon Linux 2023 ou Ubuntu 22.04
# - Instance Type: t3.small (2 vCPU, 2GB RAM)
# - Key Pair: Criar ou usar existente
# - Security Group: 
#   - SSH (22) - seu IP
#   - HTTP (80) - anywhere
#   - HTTPS (443) - anywhere
#   - Custom TCP (3000) - anywhere (Portal & Auth)
#   - Custom TCP (3001) - anywhere (Destinos Core)
#   - Custom TCP (3002) - anywhere (Analytics)
```

### 2. Conectar na Instância

```bash
# Via SSH
ssh -i "sua-chave.pem" ec2-user@seu-ip-ec2

# Ou via AWS Session Manager (sem SSH)
```

### 3. Instalar Dependências

```bash
# Atualizar sistema
sudo yum update -y  # Amazon Linux
# ou
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Instalar Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux
# ou
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs  # Ubuntu

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar Git
sudo yum install -y git  # Amazon Linux
# ou
sudo apt install -y git  # Ubuntu
```

### 4. Clonar e Configurar o Projeto

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/rotas-nordestinas.git
cd rotas-nordestinas

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar com suas credenciais

# Build do projeto
npm run build
```

### 5. Iniciar com PM2

```bash
# Portal & Auth (porta 3000)
pm2 start npm --name "portal-auth" -- start
pm2 save

# Destinos Core (porta 3001) - em outra instância
pm2 start npm --name "destinos-core" -- start
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup
```

### 6. Configurar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo yum install -y nginx  # Amazon Linux
# ou
sudo apt install -y nginx  # Ubuntu

# Configurar
sudo nano /etc/nginx/conf.d/rotas-nordestinas.conf
```

```nginx
# Portal & Auth
server {
    listen 80;
    server_name portal.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Destinos Core API
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🐳 Deploy com Docker

### Criar Dockerfile para Portal & Auth

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

### Criar Dockerfile para Destinos Core

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

### Docker Compose na AWS

```bash
# Subir containers
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

---

## 💰 Custos Estimados

| Serviço | Configuração | Custo Mensal (estimado) |
|---------|-------------|------------------------|
| EC2 (2x t3.small) | 2 vCPU, 2GB RAM cada | ~$30 |
| RDS (db.t3.micro) | 20GB SSD | ~$15 |
| S3 | 10GB | ~$1 |
| **Total** | | **~$46/mês** |

### Dicas para Economizar
1. Usar **Free Tier** (12 meses grátis)
2. Usar **Spot Instances** para dev/teste
3. Desligar instâncias fora do horário comercial
4. Usar **Reserved Instances** para produção

---

## 🔐 Segurança

### Security Groups
```bash
# Regras recomendadas
- SSH (22): Apenas seu IP
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- App (3000-3002): 0.0.0.0/0 ou IP específico
```

### Variáveis de Ambiente
```bash
# NUNCA commitar .env no Git
# Usar AWS Systems Manager Parameter Store ou Secrets Manager

# Exemplo:
aws ssm put-parameter \
  --name "/rotas-nordestinas/DB_PASSWORD" \
  --value "sua-senha-segura" \
  --type "SecureString"
```

---

## 📋 Checklist de Deploy

- [ ] Instância EC2 criada e configurada
- [ ] Node.js e PM2 instalados
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Build do projeto executado
- [ ] PM2 iniciando os serviços
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/HTTPS configurado (Let's Encrypt)
- [ ] Security Groups configurados
- [ ] Monitoramento ativo (CloudWatch)

---

*AWS Setup — Rotas Nordestinas 2026.2*
