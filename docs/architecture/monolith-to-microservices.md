# 🔄 Do Monólito aos Microsserviços

**Como transformar um sistema monolítico em arquitetura de microsserviços**

---

## 📊 Estado Atual: Monólito

O projeto **atualmente** é um **monólito**: tudo está junto em um único programa.

```
┌─────────────────────────────────────────────┐
│              MONÓLITO (atual)               │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Frontend │  │ API      │  │ Banco de  │  │
│  │ (React)  │  │ Routes   │  │ Dados     │  │
│  │          │  │ (Tudo    │  │ (Tudo     │  │
│  │ Páginas  │  │ junto)   │  │ junto)    │  │
│  │ Component│  │ Auth     │  │ Users     │  │
│  │ Mapas    │  │ Cidades  │  │ Cidades   │  │
│  │          │  │ Coment.  │  │ Coment.   │  │
│  │          │  │ Favoritos│  │ Favoritos │  │
│  └─────────┘  └──────────┘  └───────────┘  │
│                                             │
│  Tudo roda em UM processo (Next.js)         │
│  Tudo acessa UM banco (Supabase/PostgreSQL) │
└─────────────────────────────────────────────┘
```

### Tecnologias Atuais
- Frontend: Next.js 15 + React 19 + TypeScript
- Backend: Next.js API Routes (Node.js)
- Banco: Supabase (PostgreSQL) com RLS
- Autenticação: Supabase Auth
- Mapas: Leaflet + React-Leaflet
- HTTP Client: Axios

---

## ⚠️ Problemas do Monólito

| Problema | Impacto |
|----------|---------|
| **Acoplamento** | Se uma parte quebra, tudo quebra |
| **Escalabilidade** | Difícil de escalar partes específicas |
| **Manutenção** | Difícil de atualizar sem parar tudo |
| **Requisitos** | Não atende aos requisitos da disciplina |
| **Deploy** | Qualquer mudança requer redeploy completo |
| **Time-to-market** | Lentidão para novas funcionalidades |

---

## 🎯 Solução: Microsserviços

A disciplina exige que transformemos o monólito em **microsserviços**: dividir o sistema em partes menores, independentes, cada uma fazendo uma coisa bem feita.

```
┌─────────────────────────────────────────────────────────────┐
│                    MICROSSERVIÇOS                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Serviço 1    │  │ Serviço 2    │  │ Serviço 3    │     │
│  │ Portal & Auth│  │ Destinos Core│  │ Analytics    │     │
│  │              │  │              │  │              │     │
│  │ Frontend     │  │ CRUD Cidades │  │ Métricas     │     │
│  │ Login        │  │ Comentários  │  │ Notificações │     │
│  │ Perfil       │  │ Favoritos    │  │ Dashboard    │     │
│  │              │  │ Sugestões    │  │              │     │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │     │
│  │ │ DB Auth  │ │  │ │ DB Core  │ │  │ │ DB Ana-  │ │     │
│  │ │(Postgres)│ │  │ │(Postgres)│ │  │ │lytics    │ │     │
│  │ └──────────┘ │  │ └──────────┘ │  │ │(SQLite)  │ │     │
│  └──────────────┘  └──────────────┘  │ └──────────┘ │     │
│                                      └──────────────┘     │
│        AWS                 AWS               GCP            │
└─────────────────────────────────────────────────────────────┘
```

### Vantagens dos Microsserviços

| Vantagem | Explicação |
|----------|-----------|
| **Isolamento** | Se um serviço quebra, os outros continuam funcionando |
| **Escalabilidade** | Cada serviço pode escalar independentemente |
| **Manutenção** | Cada serviço pode ser atualizado sem parar o sistema |
| **Flexibilidade** | Cada serviço pode usar a tecnologia ideal para sua função |
| **Requisitos** | Atende perfeitamente aos requisitos da disciplina |

---

## 📋 Passo a Passo da Transformação

### Fase 1: Identificar Bounded Contexts
1. Analisar o domínio do negócio
2. Identificar capacidades de negócio distintas
3. Definir fronteiras de cada contexto

### Fase 2: Extrair Serviços
1. Criar repositório separado para cada serviço
2. Definir interfaces claras entre serviços
3. Implementar database per service

### Fase 3: Configurar Comunicação
1. Implementar HTTP/REST síncrono para dados em tempo real
2. Configurar Pub/Sub para processamento assíncrono
3. Testar fluxos end-to-end

### Fase 4: Deploy e Orquestração
1. Configurar Docker para cada serviço
2. Implementar Docker Compose para desenvolvimento local
3. Configurar deploy em cloud (AWS/GCP)

---

## 📊 Comparação: Monólito vs Microsserviços

| Aspecto | Monólito | Microsserviços |
|---------|----------|----------------|
| **Deploy** | Tudo junto | Independente por serviço |
| **Escalabilidade** | Horizontal total | Por serviço |
| **Falha** | Afeta tudo | Afeta apenas o serviço |
| **Tecnologia** | Uma só | Múltiplas por serviço |
| **Complexidade** | Baixa inicial | Maior, mas mais flexível |
| **Equipe** | Pequena | Múltiplas equipes |

---

*Transformação de Monólito — Rotas Nordestinas 2026.2*
