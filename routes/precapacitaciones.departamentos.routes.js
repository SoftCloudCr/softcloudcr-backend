const express = require("express");
const router = express.Router();
const {
  asociarDepartamentoACapacitacion,
  eliminarDepartamentoDeCapacitacion,
  obtenerDepartamentosPorCapacitacion,
  obtenerCapacitacionesPorDepartamento
} = require("../controllers/precapacitaciones.departamentos.controller");

router.post("/asociar", asociarDepartamentoACapacitacion);
router.delete("/eliminar", eliminarDepartamentoDeCapacitacion);
router.get("/:id_capacitacion/:id_empresa", obtenerDepartamentosPorCapacitacion);
router.get("/por-departamento/:id_departamento/:id_empresa", obtenerCapacitacionesPorDepartamento);

module.exports = router;
