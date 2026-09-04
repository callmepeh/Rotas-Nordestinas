// ============================================================================
// ROTAS NORDESTINAS — Teste de Latência Inter-Cloud
// Disciplina: TSD (Pós-Graduação) — Análise de latência AWS ↔ GCP
// Profª: Juliana Oliveira de Carvalho — UFPI 2026.2
//
// Este script mede a latência de comunicação entre serviços hospedados
// em provedores diferentes (AWS e GCP), comparando com chamadas no mesmo
// provedor.
// ============================================================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// ─── Métricas Customizadas ──────────────────────────────────────────────────
const awsToAwsLatency = new Trend('aws_to_aws_latency');
const awsToGcpLatency = new Trend('aws_to_gcp_latency');
const gcpToGcpLatency = new Trend('gcp_to_gcp_latency');
const roundTripLatency = new Trend('round_trip_latency');
const totalCalls = new Counter('total_inter_cloud_calls');

// ─── URLs dos Serviços ─────────────────────────────────────────────────────
const AWS_PORTAL_URL = __ENV.AWS_PORTAL_URL || 'http://localhost:3000';
const AWS_CORE_URL = __ENV.AWS_CORE_URL || 'http://localhost:3001';
const GCP_ANALYTICS_URL = __ENV.GCP_ANALYTICS_URL || 'http://localhost:3002';

// ─── Configuração ───────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '1m', target: 50 },     // Baseline
    { duration: '2m', target: 100 },    // Carga moderada
    { duration: '2m', target: 200 },    // Carga alta
    { duration: '1m', target: 50 },     // Recovery
  ],
  thresholds: {
    aws_to_aws_latency: ['p(95)<200'],
    aws_to_gcp_latency: ['p(95)<500'],
    gcp_to_gcp_latency: ['p(95)<150'],
  },
};

// ─── Teste 1: Latência AWS → AWS (Portal → Core) ───────────────────────────
function testAwsToAws() {
  group('AWS → AWS (same region)', () => {
    // Portal busca cidades no Core (mesmo provedor)
    const start = Date.now();
    const res = http.get(`${AWS_CORE_URL}/api/cidades`);
    const latency = Date.now() - start;
    awsToAwsLatency.add(latency);

    check(res, {
      'aws-to-aws status 200': (r) => r.status === 200,
      'aws-to-aws latency < 100ms': (r) => r.timings.duration < 100,
    });

    totalCalls.add(1);
  });
}

// ─── Teste 2: Latência AWS → GCP (Core → Analytics) ────────────────────────
function testAwsToGcp() {
  group('AWS → GCP (cross-cloud)', () => {
    // Core envia evento de analytics para GCP (comunicação inter-cloud)
    const payload = JSON.stringify({
      event: 'inter_cloud_test',
      data: {
        source: 'aws',
        target: 'gcp',
        timestamp: new Date().toISOString(),
        cidadeId: 'test-cidade-' + Math.floor(Math.random() * 100),
      },
    });

    const start = Date.now();
    const res = http.post(`${GCP_ANALYTICS_URL}/api/analytics/event`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    const latency = Date.now() - start;
    awsToGcpLatency.add(latency);

    check(res, {
      'aws-to-gcp status 200': (r) => r.status === 200,
      'aws-to-gcp latency < 500ms': (r) => r.timings.duration < 500,
    });

    totalCalls.add(1);
  });
}

// ─── Teste 3: Latência GCP → GCP (interno) ────────────────────────────────
function testGcpToGcp() {
  group('GCP → GCP (same region)', () => {
    // Analytics busca suas próprias métricas
    const start = Date.now();
    const res = http.get(`${GCP_ANALYTICS_URL}/api/analytics/popular`);
    const latency = Date.now() - start;
    gcpToGcpLatency.add(latency);

    check(res, {
      'gcp-to-gcp status 200': (r) => r.status === 200,
      'gcp-to-gcp latency < 100ms': (r) => r.timings.duration < 100,
    });

    totalCalls.add(1);
  });
}

// ─── Teste 4: Round-Trip (Portal AWS → Core AWS → Analytics GCP) ───────────
function testRoundTrip() {
  group('Round-Trip (AWS ↔ GCP)', () => {
    const start = Date.now();

    // 1. Buscar cidades (AWS)
    const cidades = http.get(`${AWS_CORE_URL}/api/cidades`);
    check(cidades, { 'roundtrip step1 ok': (r) => r.status === 200 });

    sleep(0.1);

    // 2. Registrar evento de analytics (AWS → GCP)
    const evento = http.post(`${GCP_ANALYTICS_URL}/api/analytics/event`, 
      JSON.stringify({
        event: 'roundtrip_test',
        data: { timestamp: new Date().toISOString() }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(evento, { 'roundtrip step2 ok': (r) => r.status === 200 });

    sleep(0.1);

    // 3. Buscar métricas de volta (GCP)
    const metrics = http.get(`${GCP_ANALYTICS_URL}/api/analytics/popular`);
    check(metrics, { 'roundtrip step3 ok': (r) => r.status === 200 });

    const totalLatency = Date.now() - start;
    roundTripLatency.add(totalLatency);

    check(null, {
      'roundtrip total < 1000ms': () => totalLatency < 1000,
    });

    totalCalls.add(3);
  });
}

// ─── Função Principal ──────────────────────────────────────────────────────
export default function () {
  // Executar testes com pesos diferentes
  const rand = Math.random();

  if (rand < 0.3) {
    testAwsToAws();
  } else if (rand < 0.6) {
    testAwsToGcp();
  } else if (rand < 0.8) {
    testGcpToGcp();
  } else {
    testRoundTrip();
  }

  sleep(Math.random() * 2 + 1);
}

// ─── Setup ─────────────────────────────────────────────────────────────────
export function setup() {
  console.log('========================================');
  console.log('ROTAS NORDESTINAS — Teste Inter-Cloud');
  console.log('========================================');
  console.log(`AWS Portal:  ${AWS_PORTAL_URL}`);
  console.log(`AWS Core:    ${AWS_CORE_URL}`);
  console.log(`GCP Analytics: ${GCP_ANALYTICS_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('========================================');

  // Verificar conectividade
  const checks = [
    { name: 'AWS Portal', url: AWS_PORTAL_URL },
    { name: 'AWS Core', url: AWS_CORE_URL },
    { name: 'GCP Analytics', url: GCP_ANALYTICS_URL },
  ];

  for (const check of checks) {
    try {
      const res = http.get(`${check.url}/api/health`);
      console.log(`  ${check.name}: ${res.status === 200 ? '✅' : '⚠️ ' + res.status}`);
    } catch (e) {
      console.log(`  ${check.name}: ❌ ${e.message}`);
    }
  }

  return { startTime: Date.now() };
}

// ─── Teardown ──────────────────────────────────────────────────────────────
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  
  console.log('\n========================================');
  console.log('RESULTADOS DA ANÁLISE INTER-CLOUD');
  console.log('========================================');
  console.log(`Duração total: ${duration.toFixed(1)}s`);
  console.log('Verifique os arquivos de summary para métricas detalhadas.');
  console.log('');
  console.log('Métricas esperadas:');
  console.log('  AWS → AWS:   p95 < 200ms (mesma região)');
  console.log('  GCP → GCP:   p95 < 150ms (mesma região)');
  console.log('  AWS → GCP:   p95 < 500ms (cross-cloud)');
  console.log('  Round-trip:  p99 < 1000ms');
  console.log('========================================');
}

// ─── Relatório ─────────────────────────────────────────────────────────────
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    [`inter-cloud-summary-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
