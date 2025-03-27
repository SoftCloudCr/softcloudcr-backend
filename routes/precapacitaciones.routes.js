const express = require("express");
const router = express.Router();
const {
  crearPreCapacitacion,
  actualizarPreCapacitacion,
  obtenerPreCapacitaciones,
  activarPreCapacitacion,
  cambiarEstadoPreCapacitacion
} = require("../controllers/precapacitaciones.controller");

router.post("/crear", crearPreCapacitacion);
router.put("/editar/:id_capacitacion", actualizarPreCapacitacion);
router.get("/empresa/:id_empresa", obtenerPreCapacitaciones);
router.patch("/activar/:id_capacitacion", activarPreCapacitacion);
router.patch("/estado/:id_capacitacion", cambiarEstadoPreCapacitacion);

module.exports = router;
