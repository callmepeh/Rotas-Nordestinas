const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

// Rotas públicas
router.post("/", userController.createUser);

// Rotas protegidas (requer autenticação)
router.get("/", authMiddleware, userController.listarTodos);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", authMiddleware, userController.atualizarUsuario);
router.delete("/:id", authMiddleware, userController.deletarUsuario);

module.exports = router;
