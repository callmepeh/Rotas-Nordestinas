#!/bin/bash
# ============================================================================
# ROTAS NORDESTINAS — Setup GCP Compute Engine
# Disciplina: TSD (Pós-Graduação) — Multi-cloud AWS + GCP
# Profª: Juliana Oliveira de Carvalho — UFPI 2026.2
# ============================================================================

set -e

echo "==========================================="
echo " ROTAS NORDESTINAS — Setup GCP"
echo " Analytics & Notification Service"
echo "==========================================="

# ─── 1. Atualizar sistema ──────────────────────────────────────────────────
echo "[1/6] Atualizando sistema..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ─── 2. Instalar Docker ───────────────────────────────────────────────────
echo "[2/6] Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker instalado com sucesso!"
else
    echo "Docker já instalado."
fi

# ─── 3. Instalar Docker Compose ───────────────────────────────────────────
echo "[3/6] Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose instalado!"
else
    echo "Docker Compose já instalado."
fi

# ─── 4. Configurar Google Cloud Pub/Sub ───────────────────────────────────
echo "[4/6] Configurando Google Cloud Pub/Sub..."
echo "⚠️  IMPORTANTE: Execute os seguintes comandos no seu ambiente local com gcloud:"
echo ""
echo "  # Criar tópico"
echo "  gcloud pubsub topics create rotas-events"
echo ""
echo "  # Criar assinatura"
echo "  gcloud pubsub subscriptions create rotas-analytics-sub --topic=rotas-events"
echo ""
echo "  # Criar conta de serviço"
echo "  gcloud iam service-accounts create rotas-analytics-sa \\"
echo "    --display-name='Rotas Analytics Service Account'"
echo ""
echo "  # Gerar chave da conta de serviço"
echo "  gcloud iam service-accounts keys create ./gcp-service-account.json \\"
echo "    --iam-account=rotas-analytics-sa@<seu-project-id>.iam.gserviceaccount.com"
echo ""
echo "  # Conceder permissões"
echo "  gcloud projects add-iam-policy-binding <seu-project-id> \\"
echo "    --member='serviceAccount:rotas-analytics-sa@<seu-project-id>.iam.gserviceaccount.com' \\"
echo "    --role='roles/pubsub.subscriber'"
echo ""

# ─── 5. Criar diretório do projeto ───────────────────────────────────────
echo "[5/6] Criando diretório do projeto..."
sudo mkdir -p /opt/rotas-nordestinas
sudo chown $USER:$USER /opt/rotas-nordestinas

# ─── 6. Configurar firewall ───────────────────────────────────────────────
echo "[6/6] Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3002/tcp  # Analytics API
    sudo ufw --force enable
    echo "Firewall configurado!"
fi

# ─── Criar docker-compose apenas para Analytics ──────────────────────────
cat > /opt/rotas-nordestinas/docker-compose-analytics.yml << 'ANALYTICS_COMPOSE'
version: '3.8'

services:
  analytics:
    build:
      context: ./analytics-service
      dockerfile: Dockerfile
    container_name: rotas-analytics
    restart: unless-stopped
    ports:
      - "3002:3002"
    environment:
      NODE_ENV: production
      DB_PATH: /data/analytics.db
      PORT: 3002
      GCP_PROJECT_ID: ${GCP_PROJECT_ID}
      GCP_PUBSUB_TOPIC: rotas-events
      GCP_PUBSUB_SUBSCRIPTION: rotas-analytics-sub
    volumes:
      - analytics_data:/data
    networks:
      - rotas-network

  # RabbitMQ como alternativa ao Pub/Sub (para testes locais)
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: rotas-rabbitmq
    restart: unless-stopped
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: rabbit_secret_2026
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - rotas-network

volumes:
  analytics_data:
  rabbitmq_data:

networks:
  rotas-network:
    driver: bridge
ANALYTICS_COMPOSE

echo ""
echo "==========================================="
echo " ✅ SETUP GCP CONCLUÍDO!"
echo "==========================================="
echo ""
echo "Este servidor hospeda APENAS o Analytics & Notification Service."
echo "O Portal e Destinos Core ficam no AWS."
echo ""
echo "Próximos passos:"
echo "  1. Configure o Pub/Sub conforme as instruções acima"
echo "  2. Clone o repositório:"
echo "     cd /opt/rotas-nordestinas"
echo "     git clone <seu-repo> ."
echo ""
echo "  3. Inicie o Analytics:"
echo "     cd /opt/rotas-nordestinas"
echo "     docker-compose -f docker-compose-analytics.yml up -d --build"
echo ""
echo "  4. Verifique o Pub/Sub:"
echo "     curl http://localhost:3002/api/analytics/popular"
echo ""
echo "  5. Monitore mensagens:"
echo "     gcloud pubsub subscriptions pull rotas-analytics-sub --auto-ack"
echo ""
