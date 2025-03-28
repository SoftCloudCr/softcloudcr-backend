const express = require("express");
const router = express.Router();
const { registrarIntento } = require("../controllers/intentos.controller");

// Ruta para registrar un intento de cuestionario
router.post("/intentos", registrarIntento);

module.exports = router;
