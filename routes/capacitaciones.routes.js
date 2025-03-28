const express = require("express");
const router = express.Router();
const { activarCapacitacion,vistaPreviaCapacitacionEmpleado } = require("../controllers/capacitaciones.controller");

// Activar una capacitación real desde una plantilla
router.post("/activar/:id_capacitacion", activarCapacitacion);

// Vista previoa de las capacitaciones
router.get("/vista-previa/:id_asignacion", vistaPreviaCapacitacionEmpleado);

module.exports = router;
