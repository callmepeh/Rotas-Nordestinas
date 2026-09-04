#!/bin/bash
# ============================================================================
# ROTAS NORDESTINAS — Setup de Instância EC2 (AWS)
# Disciplina: TES + TSD — UFPI 2026.2
# ============================================================================

set -e

echo "==========================================="
echo " ROTAS NORDESTINAS — Setup EC2"
echo "==========================================="

# ─── 1. Atualizar sistema ──────────────────────────────────────────────────
echo "[1/8] Atualizando sistema..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ─── 2. Instalar Docker ───────────────────────────────────────────────────
echo "[2/8] Instalando Docker..."
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
echo "[3/8] Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose instalado!"
else
    echo "Docker Compose já instalado."
fi

# ─── 4. Instalar Node.js (para deployment sem Docker) ─────────────────────
echo "[4/8] Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js $(node -v) instalado!"
else
    echo "Node.js já instalado: $(node -v)"
fi

# ─── 5. Instalar PM2 (process manager) ────────────────────────────────────
echo "[5/8] Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "PM2 instalado!"
else
    echo "PM2 já instalado."
fi

# ─── 6. Instalar Nginx ────────────────────────────────────────────────────
echo "[6/8] Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    echo "Nginx instalado!"
else
    echo "Nginx já instalado."
fi

# ─── 7. Configurar Nginx Reverse Proxy ────────────────────────────────────
echo "[7/8] Configurando Nginx..."
sudo tee /etc/nginx/sites-available/rotas-nordestinas > /dev/null << 'NGINX_CONF'
server {
    listen 80;
    server_name _;

    # Portal & Auth Service (Frontend + Auth API)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Destinos Core Service (API)
    location /api/core/ {
        rewrite ^/api/core/(.*) /api/$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Analytics Service (API)
    location /api/analytics/ {
        rewrite ^/api/analytics/(.*) /api/$1 break;
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX_CONF

sudo ln -sf /etc/nginx/sites-available/rotas-nordestinas /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
echo "Nginx configurado!"

# ─── 8. Configurar firewall ───────────────────────────────────────────────
echo "[8/8] Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3000/tcp  # Portal
    sudo ufw allow 3001/tcp  # Destinos Core
    sudo ufw allow 3002/tcp  # Analytics
    sudo ufw allow 5432/tcp  # PostgreSQL (interno)
    sudo ufw --force enable
    echo "Firewall configurado!"
fi

# ─── Criar diretório do projeto ───────────────────────────────────────────
echo "Criando diretório do projeto..."
sudo mkdir -p /opt/rotas-nordestinas
sudo chown $USER:$USER /opt/rotas-nordestinas

# ─── Criar script de deploy ───────────────────────────────────────────────
cat > /opt/rotas-nordestinas/deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

cd /opt/rotas-nordestinas

echo "Fazendo pull do repositório..."
git pull origin main

echo "Copiando docker-compose..."
cp Topicos\ em\ Nuvem\ \(Juliana\)/infra/docker-compose.yml .

echo "Parando containers antigos..."
docker-compose down

echo "Construindo e iniciando containers..."
docker-compose up -d --build

echo "Aguardando serviços iniciarem..."
sleep 10

echo "Verificando status dos containers..."
docker-compose ps

echo "✅ Deploy concluído!"
DEPLOY_SCRIPT
chmod +x /opt/rotas-nordestinas/deploy.sh

echo ""
echo "==========================================="
echo " ✅ SETUP CONCLUÍDO!"
echo "==========================================="
echo ""
echo "Próximos passos:"
echo "  1. Clone o repositório:"
echo "     cd /opt/rotas-nordestinas"
echo "     git clone <seu-repo> ."
echo ""
echo "  2. Para deployment SEM Docker (EC2 puro):"
echo "     cd portal-auth-service && npm install && pm2 start npm --name portal -- start"
echo "     cd destinos-core-service && npm install && pm2 start npm --name core -- start"
echo "     cd analytics-service && npm install && pm2 start npm --name analytics -- start"
echo ""
echo "  3. Para deployment COM Docker:"
echo "     cd /opt/rotas-nordestinas"
echo "     docker-compose up -d --build"
echo ""
echo "  4. Acessar:"
echo "     http://<ec2-public-ip>"
echo ""
