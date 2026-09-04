# 🔗 Padrões de Comunicação entre Serviços

**Como os microsserviços se comunicam entre si**

---

## 📊 Visão Geral

```
┌─────────────┐   HTTP/REST   ┌─────────────┐   Pub/Sub   ┌─────────────┐
│ Portal &    │◄─────────────►│ Destinos    │◄───────────►│ Analytics   │
│ Auth        │   (síncrono)  │ Core        │  (assíncrono)│             │
└─────────────┘               └─────────────┘             └─────────────┘
```

---

## 🔄 Comunicação Síncrona (Portal → Destinos Core)

### Quando usar
Quando o usuário precisa ver o resultado **agora**. O Portal faz uma pergunta ao Destinos Core e espera a resposta.

### Exemplo de fluxo
```
Usuário clica em "Fortaleza"

Portal & Auth ──── "Quais os detalhes de Fortaleza?" ────► Destinos Core
                                                                    │
Portal & Auth ◄─── "{ nome: 'Fortaleza', pontos: [...] }" ────────┘
     │
     ▼
Usuário vê os dados na tela
```

### Implementação
```typescript
// Portal & Auth Service — chamada ao Destinos Core
const response = await fetch(`${DESTINOS_CORE_URL}/api/cidades`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const cidades = await response.json();
```

### Casos de uso
- Listar cidades
- Buscar detalhes de uma cidade
- Criar comentários
- Gerenciar favoritos
- Submeter sugestões

---

## ⚡ Comunicação Assíncrona (Destinos Core → Analytics)

### Quando usar
Quando o resultado **não precisa ser imediato**. O Destinos Core avisa o Analytics que algo aconteceu, mas não espera a resposta.

### Exemplo de fluxo
```
Usuário adicionou um favorito

Destinos Core ──── "Favorito adicionado!" ────► Analytics Service
      │                                              │
      ▼                                              ▼
Resposta imediata ao usuário              Processa em background
"Favorito salvo com sucesso"              Atualiza métricas
                                          Envia notificação se necessário
```

### Modalidade Mononuvem (TES)
HTTP paralelo assíncrono (fire-and-forget):
```
Destinos Core ──HTTP async──► Analytics Service
      │                              │
  Resposta imediata            Processamento
  ao usuário                   em background
```

### Modalidade Multinuvem (TSD)
Message Broker (RabbitMQ ou Cloud Pub/Sub):
```
Destinos Core ──► RabbitMQ/Pub/Sub ──► Analytics Service
      │                   │                    │
  Publica evento     Broker garante      Consome e
  (cidade criada,    entrega confiável   processa
  comentário add)    entre AWS e GCP
```

### Evento publicado (exemplo)
```json
{
  "event": "cidade_viewed",
  "data": {
    "cidadeId": "uuid-da-cidade",
    "userId": "uuid-do-usuario",
    "timestamp": "2026-09-04T14:30:00Z"
  }
}
```

---

## 📋 Tabela de Comunicação

| Origem | Destino | Tipo | Protocolo | Quando |
|--------|---------|------|-----------|--------|
| Portal | Destinos Core | Síncrono | HTTP/REST | Listar cidades |
| Portal | Destinos Core | Síncrono | HTTP/REST | Criar/deletar comentários |
| Portal | Destinos Core | Síncrono | HTTP/REST | Gerenciar favoritos |
| Portal | Destinos Core | Síncrono | HTTP/REST | Submeter sugestões |
| Destinos Core | Analytics | Assíncrono | HTTP/Pub/Sub | Quando cidade é acessada |
| Destinos Core | Analytics | Assíncrono | HTTP/Pub/Sub | Quando comentário é criado |
| Destinos Core | Analytics | Assíncrono | HTTP/Pub/Sub | Quando favorito é adicionado |
| Analytics | Portal | Síncrono | HTTP/REST | Buscar métricas do dashboard |
| Analytics | Portal | Assíncrono | WebSocket/SSE | Notificações em tempo real |

---

## 🔄 Fluxo Completo de uma Requisição

```
Usuário clica em "Fortaleza"
         │
         ▼
┌─────────────────┐
│ Portal & Auth   │ ← Recebe request do browser
│ (AWS)           │
└────────┬────────┘
         │ HTTP/REST síncrono
         ▼
┌─────────────────┐
│ Destinos Core   │ ← Busca dados no banco
│ (AWS)           │
└────────┬────────┘
         │ HTTP/REST assíncrono (fire-and-forget)
         ▼
┌─────────────────┐
│ Analytics       │ ← Registra: "Fortaleza foi acessada"
│ (GCP)           │    Atualiza métricas de popularidade
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Resposta volta  │ ← Dados de Fortaleza exibidos
│ ao Portal       │    ao usuário em < 200ms
└─────────────────┘
```

---

## 💡 Boas Práticas

### 1. Evitar Circuit Breakers desnecessários
Se o Analytics estiver fora do ar, o Portal e Destinos Core continuam funcionando normalmente.

### 2. Timeout adequado
- Comunicação síncrona: timeout de 5 segundos
- Comunicação assíncrona: retry com backoff exponencial

### 3. Idempotência
Eventos assíncronos devem ser idempotentes — processar o mesmo evento duas vezes deve ter o mesmo efeito.

### 4. Logging distribuído
Usar um trace ID único para rastrear requisições entre serviços.

---

*Padrões de Comunicação — Rotas Nordestinas 2026.2*
