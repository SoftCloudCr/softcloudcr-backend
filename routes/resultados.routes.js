const express = require("express");
const router = express.Router();
const { obtenerResultadoPorAsignacion } = require("../controllers/resultados.controller");

router.get("/:id_asignacion", obtenerResultadoPorAsignacion);

module.exports = router;
