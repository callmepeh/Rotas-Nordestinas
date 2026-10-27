require("dotenv").config();
const { app, prisma } = require("./auth");
const PORT = Number(process.env.PORT || 3001);
const server = app.listen(PORT, "0.0.0.0", () => console.log(`Identity service listening on ${PORT}`));
const close = async () => { server.close(); await prisma.$disconnect(); };
process.on("SIGTERM", close);
process.on("SIGINT", close);
