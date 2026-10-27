const crypto = require("node:crypto");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET deve ter ao menos 32 caracteres");
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ sub: user.id, email: user.email, role: user.funcao, exp: Math.floor(Date.now() / 1000) + 604800 });
  const body = `${header}.${payload}`;
  return `${body}.${crypto.createHmac("sha256", secret).update(body).digest("base64url")}`;
}

function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split(".");
    const body = `${header}.${payload}`;
    const expected = crypto.createHmac("sha256", process.env.JWT_SECRET).update(body).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    return claims.exp > Date.now() / 1000 ? claims : null;
  } catch { return null; }
}

function requireUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const claims = token && verifyToken(token);
  if (!claims) return res.status(401).json({ error: "Token inválido ou expirado." });
  req.user = { id: claims.sub, role: claims.role };
  next();
}

module.exports = { signToken, verifyToken, requireUser };
