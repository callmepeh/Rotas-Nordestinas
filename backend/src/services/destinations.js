const express = require("express");
const { PrismaClient } = require("../../generated/core");
const { requireUser } = require("../shared/auth");

const prisma = new PrismaClient();
const app = express();
app.use(express.json({ limit: "12mb" }));
const dtoCity = (city, user = null) => ({ id: city.id, nomeCidade: city.nomeCidade, nomecidade: city.nomeCidade, url_imagem: city.urlImagem, descricao: city.descricao, latitude: city.latitude, longitude: city.longitude, estados: city.estado, estado: city.estado, usuario: user });
const idParam = (req) => req.params.id || req.params.cidadeId;

async function usersByIds(ids) {
  if (!ids.length) return [];
  try {
    const response = await fetch(`${process.env.IDENTITY_SERVICE_URL || "http://identity:3001"}/internal/users/by-ids`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-service-token": process.env.SERVICE_TOKEN || "" },
      body: JSON.stringify({ ids }),
      signal: AbortSignal.timeout(2000),
    });
    return response.ok ? await response.json() : [];
  } catch { return []; }
}

async function enrichCities(cities) {
  const profiles = await usersByIds([...new Set(cities.map((city) => city.criadoPor).filter(Boolean))]);
  const byId = new Map(profiles.map((user) => [user.id, { id: user.id, nomeCompleto: user.nomeCompleto }]));
  return cities.map((city) => dtoCity(city, byId.get(city.criadoPor) || null));
}

app.get("/health", async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: "ok", service: "destinations" }); }
  catch { res.status(503).json({ status: "unavailable", service: "destinations" }); }
});

app.get("/api/cidades", async (_req, res) => {
  const cities = await prisma.city.findMany({ include: { estado: true }, orderBy: { nomeCidade: "asc" } });
  res.json(await enrichCities(cities));
});
app.get("/api/cidades/buscar", async (req, res) => {
  const nome = req.query.nome ?? req.query.q;
  if (!nome) return res.status(400).json({ error: "Parâmetro 'nome' é obrigatório." });
  const cities = await prisma.city.findMany({ where: { nomeCidade: { contains: String(nome), mode: "insensitive" } }, include: { estado: true } });
  res.json(await enrichCities(cities));
});
app.get("/api/cidades/:id", async (req, res) => {
  const city = await prisma.city.findUnique({ where: { id: idParam(req) }, include: { estado: true } });
  if (!city) return res.status(404).json({ error: "Cidade não encontrada." });
  res.json((await enrichCities([city]))[0]);
});
for (const [path, model] of [["pontos", prisma.touristPoint], ["como-chegar", prisma.travelOption], ["atividades", prisma.activity], ["dicas", prisma.tip]]) {
  app.get(`/api/${path}/:cidadeId`, async (req, res) => {
    const rows = await model.findMany({ where: { cidadeId: idParam(req) }, orderBy: { id: "asc" } });
    res.json(rows.map((row) => ({ ...row, id: Number(row.id), cidadeID: row.cidadeId, cidadeid: row.cidadeId, url_imagem: row.urlImagem, tipo: row.tipo })));
  });
}

app.get("/api/comentarios/por-cidade/:cidadeId", async (req, res) => {
  const rows = await prisma.comment.findMany({ where: { cidadeId: idParam(req) }, orderBy: { createdAt: "desc" } });
  const users = await usersByIds([...new Set(rows.map((r) => r.userId))]);
  const byId = new Map(users.map((user) => [user.id, { nome: user.nomeCompleto }]));
  res.json(rows.map((r) => ({ ...r, id: Number(r.id), userID: r.userId, cidadeID: r.cidadeId, created_at: r.createdAt, usuario: byId.get(r.userId) || null })));
});
app.post("/api/comentarios", requireUser, async (req, res) => {
  const cidadeId = req.body.cidadeid || req.body.cidadeID;
  if (!cidadeId || !req.body.mensagem) return res.status(400).json({ error: "Cidade e mensagem são obrigatórias." });
  if (req.body.userid && req.body.userid !== req.user.id) return res.status(403).json({ error: "Não autorizado." });
  const comment = await prisma.comment.create({ data: { userId: req.user.id, cidadeId, mensagem: req.body.mensagem } });
  res.status(201).json({ ...comment, id: Number(comment.id), userID: comment.userId, cidadeID: comment.cidadeId, created_at: comment.createdAt });
});
app.put("/api/comentarios/:id", requireUser, async (req, res) => {
  const id = BigInt(req.params.id);
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return res.status(404).json({ error: "Comentário não encontrado." });
  if (comment.userId !== req.user.id && req.user.role !== "admin") return res.status(403).json({ error: "Não autorizado." });
  const updated = await prisma.comment.update({ where: { id }, data: { mensagem: req.body.mensagem } });
  res.json({ ...updated, id: Number(updated.id), userID: updated.userId, cidadeID: updated.cidadeId });
});
app.delete("/api/comentarios/:id", requireUser, async (req, res) => {
  const id = BigInt(req.params.id);
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return res.status(404).json({ error: "Comentário não encontrado." });
  if (comment.userId !== req.user.id && req.user.role !== "admin") return res.status(403).json({ error: "Não autorizado." });
  await prisma.comment.delete({ where: { id } });
  res.json({ message: "Comentário removido com sucesso." });
});

app.get("/api/favoritos/:userID", requireUser, async (req, res) => {
  if (req.user.id !== req.params.userID && req.user.role !== "admin") return res.status(403).json({ error: "Não autorizado." });
  const rows = await prisma.favorite.findMany({ where: { userId: req.params.userID }, include: { cidade: true } });
  res.json(rows.map((fav) => ({ id: Number(fav.id), cidadeID: fav.cidadeId, nomecidade: fav.cidade.nomeCidade, nomeCidade: fav.cidade.nomeCidade, url_imagem: fav.cidade.urlImagem })));
});
app.post("/api/favoritos/add", requireUser, async (req, res) => {
  const userId = req.body.userid || req.body.userID;
  const cidadeId = req.body.cidadeid || req.body.cidadeID;
  if (userId !== req.user.id) return res.status(403).json({ error: "Não autorizado." });
  try {
    const favorite = await prisma.favorite.create({ data: { userId, cidadeId } });
    res.status(201).json({ message: "Favorito adicionado", data: [{ id: Number(favorite.id), userID: userId, cidadeID: cidadeId }] });
  } catch (error) { res.status(error.code === "P2002" ? 409 : 400).json({ error: error.code === "P2002" ? "Cidade já está nos favoritos." : "Cidade inválida." }); }
});
app.delete("/api/favoritos/remove", requireUser, async (req, res) => {
  const userId = req.body.userid || req.body.userID;
  const cidadeId = req.body.cidadeid || req.body.cidadeID;
  if (userId !== req.user.id) return res.status(403).json({ error: "Não autorizado." });
  await prisma.favorite.deleteMany({ where: { userId, cidadeId } });
  res.json({ message: "Favorito removido" });
});

app.post("/api/sugerir", requireUser, async (req, res) => {
  const b = req.body;
  const nomeCidade = b.nomecidade || b.nomeCidade;
  if (!b.estado || !nomeCidade || b.latitude == null || b.longitude == null) return res.status(400).json({ error: "Estado, cidade e coordenadas são obrigatórios." });
  const suggestion = await prisma.routeSuggestion.create({ data: { userId: req.user.id, estado: b.estado, nomeCidade, latitude: Number(b.latitude), longitude: Number(b.longitude), imagemCapa: b.imagemCapa || null, descricaoCidade: b.descricaoCidade || null, comoChegar: b.comoChegar || [], pontosTuristicos: b.pontosTuristicos || [], atividades: b.atividades || [], dicas: b.dicas || [] } });
  res.status(201).json({ message: "Sugestão enviada com sucesso!", data: { ...suggestion, id: Number(suggestion.id) } });
});

app.use((error, _req, res, _next) => {
  console.error("destinations service error", error);
  if (error.code === "P2025" || error.code === "P2003") return res.status(400).json({ error: "Registro relacionado não encontrado." });
  res.status(500).json({ error: "Erro interno no serviço de destinos." });
});
module.exports = { app, prisma };
