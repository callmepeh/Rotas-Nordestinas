// ============================================================================
// ROTAS NORDESTINAS — Testes de Carga com k6
// Disciplina: TSD (Pós-Graduação) — Testes de concorrência inter-cloud
// Profª: Juliana Oliveira de Carvalho — UFPI 2026.2
// ============================================================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Métricas Customizadas ──────────────────────────────────────────────────
const errorRate = new Rate('errors');
const cidadeLatency = new Trend('cidade_list_latency');
const searchLatency = new Trend('search_latency');
const commentLatency = new Trend('comment_create_latency');
const interCloudLatency = new Trend('inter_cloud_latency');
const totalRequests = new Counter('total_requests');

// ─── Configuração dos Estágios de Carga ─────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 10 },    // Ramp up suave
    { duration: '1m', target: 50 },     // Carga sustentada
    { duration: '30s', target: 100 },   // Pico moderado
    { duration: '1m', target: 200 },    // Carga alta
    { duration: '30s', target: 500 },   // Stress test máximo
    { duration: '1m', target: 200 },    // Recovery
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(50)<300', 'p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05'],
  },
};

// ─── Configuração ───────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// ─── Funções Auxiliares ──────────────────────────────────────────────────────
function randomCidadeId() {
  const cidades = [
    'fortaleza', 'recife', 'salvador', 'natal', 'joao-pessoa',
    'maceio', 'aracaju', 'campina-grande', 'petrolina', 'sao-luis'
  ];
  return cidades[Math.floor(Math.random() * cidades.length)];
}

function randomComentario() {
  const comentarios = [
    'Lugar incrível! Recomendo demais!',
    'Amei a praia, água cristalina.',
    'Comida deliciosa, especialmente o baião de 2.',
    'Ponto turístico muito bem conservado.',
    'Voltarei com certeza! Nota 10.',
    'A vista do morro é de tirar o fôlego.',
    'Pessoal muito receptivo e acolhedor.',
    'Roteiro perfeito para férias em família.',
  ];
  return comentarios[Math.floor(Math.random() * comentarios.length)];
}

// ─── Testes Principais ──────────────────────────────────────────────────────
export default function () {
  group('Portal & Auth Service', () => {
    // ─── Teste 1: Health Check ──────────────────────────────────────────
    let res = http.get(`${BASE_URL}/api/health`);
    check(res, {
      'portal health check status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(0.5);

    // ─── Teste 2: Login (se token não fornecido) ───────────────────────
    if (!AUTH_TOKEN) {
      const loginPayload = JSON.stringify({
        email: `user${Math.floor(Math.random() * 1000)}@test.com`,
        password: 'testpassword123',
      });

      res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' },
      });

      check(res, {
        'login response': (r) => r.status === 200 || r.status === 401,
      }) || errorRate.add(1);
      totalRequests.add(1);
    }

    sleep(0.5);
  });

  group('Destinos Core Service — Leitura', () => {
    // ─── Teste 3: Listar Cidades ────────────────────────────────────────
    const startTime = Date.now();
    let res = http.get(`${BASE_URL}/api/cidades`);
    const latency = Date.now() - startTime;
    cidadeLatency.add(latency);

    check(res, {
      'list cities status 200': (r) => r.status === 200,
      'list cities has data': (r) => {
        try {
          const data = JSON.parse(r.body);
          return Array.isArray(data) && data.length > 0;
        } catch {
          return false;
        }
      },
      'list cities latency < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(1);

    // ─── Teste 4: Buscar Cidade por Nome ───────────────────────────────
    const cidades = ['Fortaleza', 'Recife', 'Salvador', 'Natal', 'Maceió'];
    const searchQuery = cidades[Math.floor(Math.random() * cidades.length)];

    const searchStart = Date.now();
    res = http.get(`${BASE_URL}/api/cidades/buscar?q=${searchQuery}`);
    const searchTime = Date.now() - searchStart;
    searchLatency.add(searchTime);

    check(res, {
      'search cities status 200': (r) => r.status === 200,
      'search has results': (r) => {
        try {
          const data = JSON.parse(r.body);
          return Array.isArray(data);
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(1);

    // ─── Teste 5: Buscar Detalhes da Cidade ────────────────────────────
    const cidadeId = randomCidadeId();
    res = http.get(`${BASE_URL}/api/cidades/${cidadeId}`);

    check(res, {
      'city detail status 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(0.5);

    // ─── Teste 6: Pontos Turísticos ────────────────────────────────────
    res = http.get(`${BASE_URL}/api/pontos/${cidadeId}`);

    check(res, {
      'points of interest status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(0.5);

    // ─── Teste 7: Como Chegar ──────────────────────────────────────────
    res = http.get(`${BASE_URL}/api/como-chegar/${cidadeId}`);

    check(res, {
      'how to get status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(0.5);

    // ─── Teste 8: Comentários da Cidade ────────────────────────────────
    res = http.get(`${BASE_URL}/api/comentarios/por-cidade/${cidadeId}`);

    check(res, {
      'comments status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(1);
  });

  group('Destinos Core Service — Escrita', () => {
    // ─── Teste 9: Criar Comentário (autenticado) ───────────────────────
    if (AUTH_TOKEN) {
      const cidadeId = randomCidadeId();
      const commentPayload = JSON.stringify({
        cidadeId: cidadeId,
        mensagem: randomComentario(),
      });

      const commentStart = Date.now();
      const res = http.post(`${BASE_URL}/api/comentarios`, commentPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      });
      const commentTime = Date.now() - commentStart;
      commentLatency.add(commentTime);

      check(res, {
        'create comment status 201': (r) => r.status === 201,
        'create comment latency < 300ms': (r) => r.timings.duration < 300,
      }) || errorRate.add(1);
      totalRequests.add(1);
    }

    sleep(1);

    // ─── Teste 10: Toggle Favorito ─────────────────────────────────────
    if (AUTH_TOKEN) {
      const cidadeId = randomCidadeId();
      const favPayload = JSON.stringify({ cidadeId: cidadeId });

      const res = http.post(`${BASE_URL}/api/favoritos/add`, favPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      });

      check(res, {
        'toggle favorite status': (r) => r.status === 200 || r.status === 201 || r.status === 409,
      }) || errorRate.add(1);
      totalRequests.add(1);
    }

    sleep(1);
  });

  group('Analytics Service — Inter-Cloud', () => {
    // ─── Teste 11: Métricas do Dashboard ──────────────────────────────
    const analyticsStart = Date.now();
    let res = http.get(`${BASE_URL}/api/analytics/popular`);
    const analyticsTime = Date.now() - analyticsStart;
    interCloudLatency.add(analyticsTime);

    check(res, {
      'analytics popular status 200': (r) => r.status === 200,
      'analytics latency < 1000ms': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(1);

    // ─── Teste 12: Registrar Evento ────────────────────────────────────
    const eventPayload = JSON.stringify({
      event: 'cidade_viewed',
      data: {
        cidadeId: randomCidadeId(),
        userId: AUTH_TOKEN ? 'authenticated' : 'anonymous',
        timestamp: new Date().toISOString(),
      },
    });

    res = http.post(`${BASE_URL}/api/analytics/event`, eventPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'analytics event status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    totalRequests.add(1);

    sleep(Math.random() * 3);
  });
}

// ─── Relatório de Resultados ────────────────────────────────────────────────
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    [`summary-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// ─── Setup (executado uma vez antes dos testes) ─────────────────────────────
export function setup() {
  console.log('========================================');
  console.log('ROTAS NORDESTINAS — Teste de Carga k6');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('========================================');
  
  // Verificar se o serviço está acessível
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200) {
    console.warn(`⚠️  Health check returned status ${healthCheck.status}`);
  } else {
    console.log('✅ Service is healthy');
  }
  
  return { startTime: Date.now() };
}

// ─── Teardown (executado uma vez após os testes) ────────────────────────────
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\n========================================`);
  console.log(`Test completed in ${duration.toFixed(1)}s`);
  console.log(`========================================`);
}
