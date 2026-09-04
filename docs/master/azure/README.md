# ☁️ Azure — Microsoft Azure

**Serviços complementares e comparação com AWS/GCP**

---

## 📊 Visão Geral do Azure

O Azure é uma alternativa válida para-hosting de microsserviços, com serviços equivalentes ao AWS e GCP.

### Serviços Equivalentes

| Azure | AWS | GCP | Uso no Projeto |
|-------|-----|-----|----------------|
| **Virtual Machines** | EC2 | Compute Engine | Servidores virtuais |
| **Azure Container Instances** | ECS | Cloud Run | Containers sem servidor |
| **Azure SQL Database** | RDS | Cloud SQL | Bancos de dados SQL |
| **Blob Storage** | S3 | Cloud Storage | Armazenamento de objetos |
| **Azure Service Bus** | SQS/SNS | Pub/Sub | Filas e mensageria |
| **Azure CDN** | CloudFront | Cloud CDN | Distribuição de conteúdo |

---

## 🏗️ Arquitetura no Azure

```
┌─────────────────────────────────────────────────────────────┐
│                        Azure                                │
│                                                             │
│  ┌──────────────────┐                                      │
│  │  Virtual Machine │ ← Hospedagem de serviço             │
│  │  (Standard_B2s)  │                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│  ┌────────▼─────────┐                                      │
│  │  Azure SQL       │ ← Banco de dados gerenciado         │
│  │  Database        │                                      │
│  └──────────────────┘                                      │
│                                                             │
│  ┌──────────────────┐                                      │
│  │  Blob Storage    │ ← Armazenamento de imagens          │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Completo

### 1. Criar Conta no Azure

```bash
# Acessar portal.azure.com
# Criar conta (Free Tier disponível)

# Instalar Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login
```

### 2. Criar Grupo de Recursos

```bash
# Criar resource group
az group create \
  --name rotas-nordestinas-rg \
  --location eastus
```

### 3. Criar Máquina Virtual

```bash
# Criar VM
az vm create \
  --resource-group rotas-nordestinas-rg \
  --name analytics-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --open-port 3002

# Obter IP público
az vm show \
  --resource-group rotas-nordestinas-rg \
  --name analytics-vm \
  --show-details \
  --query publicIps \
  --output tsv
```

### 4. Conectar na VM

```bash
# Via SSH
ssh azureuser@<ip-publico>
```

### 5. Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Git
sudo apt install -y git
```

### 6. Criar Azure SQL Database

```bash
# Criar servidor SQL
az sql server create \
  --name rotas-sql-server \
  --resource-group rotas-nordestinas-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password "SuaSenhaSegura123!"

# Criar banco de dados
az sql db create \
  --name rotas_analytics_db \
  --server rotas-sql-server \
  --resource-group rotas-nordestinas-rg \
  --service-tier Basic
```

### 7. Configurar Blob Storage

```bash
# Criar conta de armazenamento
az storage account create \
  --name rotasstorage \
  --resource-group rotas-nordestinas-rg \
  --location eastus \
  --sku Standard_LRS

# Criar container
az storage container create \
  --name imagens \
  --account-name rotasstorage
```

---

## 🔗 Comunicação entre Provedores

### Azure Service Bus (Alternativa ao Pub/Sub)

```javascript
// Publicar mensagem do AWS para Azure
const { ServiceBusClient } = require('@azure/service-bus');

const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION;
const client = new ServiceBusClient(connectionString);
const sender = client.createSender('rotas-events');

async function publishEvent(event) {
  const message = {
    body: JSON.stringify(event),
    contentType: 'application/json'
  };
  
  await sender.sendMessages(message);
}
```

### Consumir no Azure

```javascript
// Consumir mensagens no Azure
const { ServiceBusClient } = require('@azure/service-bus');

const client = new ServiceBusClient(connectionString);
const receiver = client.createReceiver('rotas-events');

receiver.subscribe({
  processMessage: async (message) => {
    const event = JSON.parse(message.body);
    await processEvent(event);
  },
  processError: async (error) => {
    console.error(error);
  }
});
```

---

## 💰 Custos Estimados

| Serviço | Configuração | Custo Mensal (estimado) |
|---------|-------------|------------------------|
| Virtual Machine (B2s) | 2 vCPU, 4GB RAM | ~$30 |
| Azure SQL Database | Basic, 2GB | ~$5 |
| Blob Storage | 5GB | ~$1 |
| **Total** | | **~$36/mês** |

### Free Tier
- $200 créditos iniciais (30 dias)
- 750 horas de B1S VM (12 meses)
- 250GB SQL Database (12 meses)

---

## 📊 Comparação: AWS vs GCP vs Azure

| Critério | AWS | GCP | Azure |
|----------|-----|-----|-------|
| **Facilidade de uso** | Média | Alta | Média |
| **Preço** | Médio | Baixo | Médio |
| **Documentação** | Excelente | Boa | Boa |
| **Integração com Microsoft** | - | - | Excelente |
| **Serviços gerenciados** | Muitos | Muitos | Muitos |
| **Free Tier** | 12 meses | $300 créditos | 12 meses |
| **Latência Brasil** | Boa | Boa | Boa |

### Recomendação para o Projeto

| Caso de Uso | Provedor Recomendado |
|-------------|---------------------|
| **Produção principal** | AWS (mais maduro) |
| **Analytics/Métricas** | GCP (Pub/Sub excelente) |
| **Integração Microsoft** | Azure |
| **Custo-benefício** | GCP |
| **Enterprise** | AWS ou Azure |

---

## 📋 Checklist de Deploy

- [ ] Conta Azure criada
- [ ] Azure CLI instalado e configurado
- [ ] Resource group criado
- [ ] VM criada e acessível
- [ ] Node.js e PM2 instalados
- [ ] Azure SQL Database criado
- [ ] Blob Storage configurado
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Serviço rodando
- [ ] Comunicação com AWS/GCP testada

---

*Azure Setup — Rotas Nordestinas 2026.2*
