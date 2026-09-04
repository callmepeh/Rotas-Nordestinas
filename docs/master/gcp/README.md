# ☁️ GCP — Google Cloud Platform

**Configuração e deploy do Analytics Service no GCP**

---

## 📊 Serviços Utilizados

| Serviço | Nome Completo | Uso no Projeto |
|---------|---------------|----------------|
| **Compute Engine** | Máquinas Virtuais | Hospedagem do Analytics Service |
| **Cloud Pub/Sub** | Mensageria | Comunicação assíncrona com AWS |
| **Cloud Storage** | Armazenamento | Backup e estáticos |
| **Cloud SQL** | Banco de Dados | PostgreSQL gerenciado (alternativa) |
| **Cloud Run** | Serverless | Containers sem servidor (alternativa) |

---

## 🏗️ Arquitetura no GCP

```
┌─────────────────────────────────────────────────────────────┐
│                        GCP                                  │
│                                                             │
│  ┌──────────────────┐                                      │
│  │  Analytics &     │ ← Recebe eventos do AWS via Pub/Sub │
│  │  Notification    │                                      │
│  │  (Compute Engine)│                                      │
│  │  Porta: 3002     │                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│  ┌────────▼─────────┐                                      │
│  │  SQLite (local)  │ ← Métricas e notificações           │
│  └──────────────────┘                                      │
│                                                             │
│  ┌──────────────────┐                                      │
│  │  Cloud Pub/Sub   │ ← Broker de mensagens               │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Completo

### 1. Criar Projeto no GCP

```bash
# Acessar console.cloud.google.com
# Criar novo projeto: rotas-nordestinas-gcp

# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### 2. Criar Instância Compute Engine

```bash
# Criar instância via gcloud
gcloud compute instances create analytics-server \
  --zone=us-east1-b \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --tags=analytics-server

# Configurar regras de firewall
gcloud compute firewall-rules create allow-analytics \
  --allow tcp:3002 \
  --target-tags=analytics-server \
  --description="Permitir acesso ao Analytics Service"
```

### 3. Conectar na Instância

```bash
# Via SSH
gcloud compute ssh analytics-server --zone=us-east1-b
```

### 4. Instalar Dependências

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

### 5. Configurar Cloud Pub/Sub

```bash
# Criar tópico
gcloud pubsub topics create rotas-events

# Criar assinatura
gcloud pubsub subscriptions create rotas-analytics-sub \
  --topic=rotas-events

# Verificar
gcloud pubsub topics list
gcloud pubsub subscriptions list
```

### 6. Clonar e Configurar o Projeto

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/rotas-nordestinas.git
cd rotas-nordestinas

# Instalar dependências do Analytics Service
cd analytics-service
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env

# Build
npm run build
```

### 7. Iniciar com PM2

```bash
# Analytics Service (porta 3002)
pm2 start npm --name "analytics" -- start
pm2 save
pm2 startup
```

---

## 🔗 Comunicação com AWS

### Configurar Pub/Sub no AWS (Lambda)

```javascript
// AWS Lambda — Publicar eventos para GCP Pub/Sub
const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: 'rotas-nordestinas-gcp',
  keyFilename: './gcp-service-account.json'
});

exports.handler = async (event) => {
  const topic = pubsub.topic('rotas-events');
  
  const message = {
    data: Buffer.from(JSON.stringify({
      event: 'cidade_viewed',
      data: event,
      timestamp: new Date().toISOString()
    }))
  };
  
  await topic.publishMessage(message);
  return { statusCode: 200 };
};
```

### Consumir no GCP (Compute Engine)

```javascript
// Analytics Service — Consumir eventos do Pub/Sub
const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub({ projectId: 'rotas-nordestinas-gcp' });
const subscription = pubsub.subscription('rotas-analytics-sub');

subscription.on('message', async (message) => {
  const event = JSON.parse(message.data.toString());
  
  // Processar evento
  await processEvent(event);
  
  message.ack();
});

async function processEvent(event) {
  console.log('Evento recebido:', event);
  // Salvar no banco de métricas
  // Atualizar estatísticas
  // Verificar se precisa enviar notificação
}
```

---

## 🔄 Alternativa: Cloud Run (Serverless)

Se preferir não gerenciar servidores, usar Cloud Run:

```bash
# Build e deploy do container
gcloud builds submit --tag gcr.io/rotas-nordestinas-gcp/analytics

# Deploy no Cloud Run
gcloud run deploy analytics-service \
  --image gcr.io/rotas-nordestinas-gcp/analytics \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --port 3002
```

---

## 💰 Custos Estimados

| Serviço | Configuração | Custo Mensal (estimado) |
|---------|-------------|------------------------|
| Compute Engine (e2-medium) | 2 vCPU, 4GB RAM | ~$25 |
| Cloud Pub/Sub | 10GB/mês | ~$5 |
| Cloud Storage | 5GB | ~$1 |
| **Total** | | **~$31/mês** |

### Dicas para Economizar
1. Usar **Free Tier** ($300 créditos iniciais)
2. Usar **Preemptible VMs** para dev/teste
3. Desligar instâncias fora do horário
4. Usar **Cloud Run** (paga apenas por uso)

---

## 📋 Checklist de Deploy

- [ ] Projeto GCP criado
- [ ] gcloud CLI configurado
- [ ] Instância Compute Engine criada
- [ ] Node.js e PM2 instalados
- [ ] Cloud Pub/Sub configurado
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Analytics Service rodando
- [ ] Comunicação com AWS testada
- [ ] Firewall configurado

---

*GCP Setup — Rotas Nordestinas 2026.2*
