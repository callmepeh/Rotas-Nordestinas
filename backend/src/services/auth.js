const express = require("express");
const crypto = require("node:crypto");
const { PrismaClient } = require("../../generated/auth");
const { signToken, requireUser } = require("../shared/auth");

const prisma = new PrismaClient();
const app = express();
app.use(express.json({ limit: "10mb" }));
const publicUser = ({ passwordHash, ...user }) => user;
const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(`${salt}:${key.toString("hex")}`));
});
const verifyPassword = async (password, stored) => {
  const [salt, key] = (stored || "").split(":");
  if (!salt || !key) return false;
  const derived = await hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(derived.split(":")[1], "hex"), Buffer.from(key, "hex"));
};

app.get("/health", async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: "ok", service: "identity" }); }
  catch { res.status(503).json({ status: "unavailable", service: "identity" }); }
});

app.post("/api/auth/register", async (req, res) => {
  const { nomeCompleto, email, senha } = req.body;
  if (!nomeCompleto || !email || !senha || senha.length < 8) return res.status(400).json({ error: "Nome, email e senha (mínimo 8 caracteres) são obrigatórios." });
  try {
    const user = await prisma.user.create({ data: { nomeCompleto, email: email.toLowerCase(), passwordHash: await hashPassword(senha) } });
    res.status(201).json({ message: "Cadastro criado com sucesso.", user: publicUser(user) });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "Este email já está cadastrado." });
    res.status(500).json({ error: "Erro ao criar cadastro." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, senha } = req.body;
  const user = email && await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(senha || "", user.passwordHash))) return res.status(401).json({ error: "Credenciais inválidas." });
  res.json({ message: "Login realizado com sucesso.", token: signToken(user), user: publicUser(user) });
});

app.get("/api/auth/me", requireUser, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
  res.json({ user: publicUser(user) });
});

app.put("/api/auth/update/:id", requireUser, async (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: "Não autorizado." });
  const { action, ...body } = req.body;
  const allowed = ["nomeCompleto", "telefone", "dataNascimento", "siglaEstado", "nomeCidade", "profissao", "cpf"];
  const data = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (action === "request_collaborator") data.funcao = "colaborador_pendente";
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ message: action === "request_collaborator" ? "Sua solicitação foi enviada e está aguardando análise!" : "Perfil atualizado com sucesso!", user: publicUser(user) });
});

app.post("/internal/users/by-ids", (req, res, next) => {
  const expected = process.env.SERVICE_TOKEN || "";
  const supplied = req.headers["x-service-token"] || "";
  if (!expected || supplied !== expected) return res.status(401).json({ error: "Credencial de serviço inválida." });
  next();
}, async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, nomeCompleto: true } });
  res.json(users);
});

app.use((error, _req, res, _next) => { console.error("identity service error", error); res.status(500).json({ error: "Erro interno no serviço de identidade." }); });
module.exports = { app, prisma };
