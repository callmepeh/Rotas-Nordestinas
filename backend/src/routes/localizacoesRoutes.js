const express = require("express");
const router = express.Router();
const localizacoesController = require("../controllers/localizacoesController.js");

// Rotas públicas de localização geográfica
router.get("/estados", localizacoesController.listarEstados);
router.get("/estados/:estadoID/cidades", localizacoesController.listarCidadesPorEstado);
router.get("/estados/sigla/:sigla", localizacoesController.buscarEstadoPorSigla);

module.exports = router;
