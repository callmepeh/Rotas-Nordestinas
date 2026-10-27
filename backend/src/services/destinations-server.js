require("dotenv").config();
const { app, prisma } = require("./destinations");
const PORT = Number(process.env.PORT || 3002);
const server = app.listen(PORT, "0.0.0.0", () => console.log(`Destinations service listening on ${PORT}`));
const close = async () => { server.close(); await prisma.$disconnect(); };
process.on("SIGTERM", close);
process.on("SIGINT", close);
