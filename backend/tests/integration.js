const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { PrismaClient: AuthClient } = require("../generated/auth");
const { PrismaClient: CoreClient } = require("../generated/core");

const authDb = new AuthClient();
const coreDb = new CoreClient();
const gateway = process.env.API_GATEWAY_URL || "http://localhost:5000";
const userId = randomUUID();
let authUserId;
const cityId = randomUUID();
const email = `integration-${userId}@example.test`;

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${gateway}${path}`, {
    method,
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();
  return { status: response.status, data };
}

async function main() {
  const state = await coreDb.state.findUnique({ where: { id: 7 } });
  assert.ok(state, "seeded state row is present");
  await coreDb.city.create({ data: { id: cityId, nomeCidade: "Cidade de Integração", estadoId: state.id, latitude: -5.09, longitude: -42.80 } });
  await coreDb.touristPoint.create({ data: { cidadeId: cityId, titulo: "Ponto de teste" } });

  const health = await fetch(`${gateway}/health`);
  assert.equal(health.status, 200, "gateway health aggregates both services");

  const register = await request("/api/auth/register", { method: "POST", body: { nomeCompleto: "Teste Integração", email, senha: "SenhaLocal123!" } });
  assert.equal(register.status, 201, JSON.stringify(register.data));
  authUserId = register.data.user.id;
  const login = await request("/api/auth/login", { method: "POST", body: { email, senha: "SenhaLocal123!" } });
  assert.equal(login.status, 200, JSON.stringify(login.data));
  const token = login.data.token;
  assert.ok(token, "identity service returns a JWT");

  const profile = await request("/api/auth/me", { token });
  assert.equal(profile.data.user.id, register.data.user.id);
  await coreDb.city.update({ where: { id: cityId }, data: { criadoPor: profile.data.user.id } });
  const city = await request(`/api/cidades/${cityId}`);
  assert.equal(city.status, 200);
  assert.equal(city.data.nomeCidade, "Cidade de Integração");
  assert.equal(city.data.usuario.nomeCompleto, "Teste Integração", "city creator is resolved through identity service");
  const points = await request(`/api/pontos/${cityId}`);
  assert.equal(points.data.length, 1, JSON.stringify(points.data));

  const unauth = await request("/api/favoritos/add", { method: "POST", body: { userID: profile.data.user.id, cidadeID: cityId } });
  assert.equal(unauth.status, 401);
  const favorite = await request("/api/favoritos/add", { method: "POST", token, body: { userID: profile.data.user.id, cidadeID: cityId } });
  assert.equal(favorite.status, 201, JSON.stringify(favorite.data));
  assert.equal((await request("/api/favoritos/add", { method: "POST", token, body: { userID: profile.data.user.id, cidadeID: cityId } })).status, 409);
  assert.equal((await request(`/api/favoritos/${profile.data.user.id}`, { token })).data.length, 1);

  const comment = await request("/api/comentarios", { method: "POST", token, body: { userID: profile.data.user.id, cidadeID: cityId, mensagem: "Integração persistida" } });
  assert.equal(comment.status, 201, JSON.stringify(comment.data));
  const comments = await request(`/api/comentarios/por-cidade/${cityId}`);
  assert.equal(comments.data[0].usuario.nome, "Teste Integração", "identity lookup enriches comments across service boundary");
  const suggestion = await request("/api/sugerir", { method: "POST", token, body: { estado: "Piauí", nomecidade: "Nova Rota", latitude: -5.1, longitude: -42.8, comoChegar: [{ nome: "Ônibus" }] } });
  assert.equal(suggestion.status, 201, JSON.stringify(suggestion.data));
  assert.equal(suggestion.data.data.status, "pendente");
  console.log("Integration validation passed: gateway, JWT, identity, catalog reads, cross-service profile lookup, favorites, comments, suggestions.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (authUserId) {
    await coreDb.routeSuggestion.deleteMany({ where: { userId: authUserId } }).catch(() => {});
    await coreDb.favorite.deleteMany({ where: { userId: authUserId } }).catch(() => {});
    await coreDb.comment.deleteMany({ where: { userId: authUserId } }).catch(() => {});
  }
  await coreDb.city.deleteMany({ where: { id: cityId } }).catch(() => {});
  await authDb.user.deleteMany({ where: { email } }).catch(() => {});
  await Promise.all([authDb.$disconnect(), coreDb.$disconnect()]);
});
