# 🧪 Testes de Carga

**Documentação dos testes de estresse e latência inter-cloud com k6**

---

## 📊 Visão Geral

### Por que testar carga?
A disciplina exige que façamos **testes de estresse** para medir como o sistema se comporta com muitos usuários simultâneos.

### Ferramenta: k6
O **k6** é uma ferramenta open-source para testes de carga. Simula centenas de usuários acessando o sistema ao mesmo tempo.

---

## 📂 Arquivos de Teste

| Arquivo | Descrição |
|---------|-----------|
| `load-test.js` | Teste de carga geral (10-500 usuários) |
| `multi-cloud-test.js` | Teste de latência inter-cloud (AWS ↔ GCP) |

---

## 🚀 Executar Testes

### Instalar k6

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [trusted=yes] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### Executar Teste de Carga Geral

```bash
# Configurar URL base
export BASE_URL=http://localhost:3000

# Executar teste
k6 run docs/testing/load-test.js

# Com token de autenticação
export AUTH_TOKEN=seu-jwt-token
k6 run docs/testing/load-test.js
```

### Executar Teste Inter-Cloud

```bash
# Configurar URLs
export AWS_PORTAL_URL=http://aws-ip:3000
export AWS_CORE_URL=http://aws-ip:3001
export GCP_ANALYTICS_URL=http://gcp-ip:3002

# Executar teste
k6 run docs/testing/multi-cloud-test.js
```

---

## 📈 Métricas Coletadas

### Métricas Padrão

| Métrica | O que mede | Meta |
|---------|-----------|------|
| **http_req_duration** | Tempo de resposta HTTP | p95 < 500ms |
| **http_req_failed** | Taxa de erro | < 5% |
| **http_reqs** | Throughput (req/s) | Maximizar |

### Métricas Customizadas

| Métrica | Descrição |
|---------|-----------|
| `cidade_list_latency` | Latência ao listar cidades |
| `search_latency` | Latência ao buscar cidades |
| `comment_create_latency` | Latência ao criar comentário |
| `inter_cloud_latency` | Latência entre provedores |
| `aws_to_aws_latency` | Latência AWS → AWS |
| `aws_to_gcp_latency` | Latência AWS → GCP |
| `gcp_to_gcp_latency` | Latência GCP → GCP |
| `round_trip_latency` | Latência round-trip completa |

---

## 📊 Estágios de Carga

### Teste Geral (load-test.js)

```
┌──────────────────────────────────────────────────────────┐
│              Carga progressiva de 10 a 500               │
│              requisições por segundo                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  10 usuários  ─────►  50  ─────►  100  ─────►  500     │
│  (30s)              (1min)       (2min)        (30s)    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

| Estágio | Duração | Usuários | Objetivo |
|---------|---------|----------|----------|
| Ramp up | 30s | 0 → 10 | Subida suave |
| Sustentada | 1min | 10 → 50 | Carga normal |
| Pico | 30s | 50 → 100 | Pico moderado |
| Alta | 1min | 100 → 200 | Carga alta |
| Stress | 30s | 200 → 500 | Teste de estresse |
| Recovery | 1min | 500 → 200 | Recuperação |
| Ramp down | 30s | 200 → 0 | Finalização |

### Teste Inter-Cloud (multi-cloud-test.js)

| Estágio | Duração | Usuários | Objetivo |
|---------|---------|----------|----------|
| Baseline | 1min | 0 → 50 | Linha de base |
| Moderada | 2min | 50 → 100 | Carga moderada |
| Alta | 2min | 100 → 200 | Carga alta |
| Recovery | 1min | 200 → 50 | Recuperação |

---

## 🎯 Thresholds (Limites)

### Teste Geral

```javascript
thresholds: {
  http_req_duration: ['p(50)<300', 'p(95)<800', 'p(99)<1500'],
  http_req_failed: ['rate<0.05'],
  errors: ['rate<0.05'],
}
```

### Teste Inter-Cloud

```javascript
thresholds: {
  aws_to_aws_latency: ['p(95)<200'],
  aws_to_gcp_latency: ['p(95)<500'],
  gcp_to_gcp_latency: ['p(95)<150'],
}
```

---

## 📊 Cenários de Comparação

### AWS → AWS (mesma nuvem)

```
Portal ──── 50ms ────► Core
Core ────── 30ms ────► Analytics (AWS)

Resultado esperado:
  p95 < 200ms
```

### AWS → GCP (multi-cloud)

```
Portal ──── 50ms ────► Core
Core ────── 150ms ───► Analytics (GCP)

Resultado esperado:
  p95 < 500ms
  Diferença: ~100-200ms de overhead inter-cloud
```

---

## 📋 Casos de Teste

### Portal & Auth Service

| # | Teste | Método | Rota |
|---|-------|--------|------|
| 1 | Health Check | GET | `/api/health` |
| 2 | Login | POST | `/api/auth/login` |

### Destinos Core Service (Leitura)

| # | Teste | Método | Rota |
|---|-------|--------|------|
| 3 | Listar Cidades | GET | `/api/cidades` |
| 4 | Buscar por Nome | GET | `/api/cidades/buscar?q=` |
| 5 | Detalhes da Cidade | GET | `/api/cidades/:id` |
| 6 | Pontos Turísticos | GET | `/api/pontos/:cidadeId` |
| 7 | Como Chegar | GET | `/api/como-chegar/:cidadeId` |
| 8 | Comentários | GET | `/api/comentarios/por-cidade/:id` |

### Destinos Core Service (Escrita)

| # | Teste | Método | Rota |
|---|-------|--------|------|
| 9 | Criar Comentário | POST | `/api/comentarios` |
| 10 | Toggle Favorito | POST | `/api/favoritos/add` |

### Analytics Service

| # | Teste | Método | Rota |
|---|-------|--------|------|
| 11 | Métricas Dashboard | GET | `/api/analytics/popular` |
| 12 | Registrar Evento | POST | `/api/analytics/event` |

---

## 📊 Relatório de Resultados

### Arquivos Gerados

```bash
# Teste geral
summary-2026-09-04T14-30-00-000Z.json

# Teste inter-cloud
inter-cloud-summary-2026-09-04T14-30-00-000Z.json
```

### Estrutura do Relatório

```json
{
  "metrics": {
    "http_req_duration": {
      "values": {
        "avg": 150,
        "med": 120,
        "p90": 250,
        "p95": 350,
        "p99": 800
      }
    },
    "http_req_failed": {
      "values": {
        "rate": 0.02
      }
    }
  }
}
```

---

## 💡 Dicas

### 1. Rodar em ambiente isolado
Não rodar testes de carga em ambiente de produção sem aviso.

### 2. Aquecer o sistema
Rodar um teste leve antes do teste principal para "aquecer" o sistema.

### 3. Monitorar recursos
Acompanhar CPU e memória durante os testes:
```bash
# No servidor
htop
docker stats
```

### 4. Comparar resultados
Salvar relatórios e comparar entre diferentes configurações.

---

## 📋 Checklist de Testes

- [ ] k6 instalado
- [ ] Serviços rodando
- [ ] Variáveis de ambiente configuradas
- [ ] Teste geral executado
- [ ] Teste inter-cloud executado
- [ ] Relatórios salvos
- [ ] Resultados analisados
- [ ] Artigo atualizado com métricas

---

*Testes de Carga — Rotas Nordestinas 2026.2*
