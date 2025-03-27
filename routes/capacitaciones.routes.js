const express = require("express");
const router = express.Router();
const { activarCapacitacion } = require("../controllers/capacitaciones.controller");

// Activar una capacitación real desde una plantilla
router.post("/activar/:id_capacitacion", activarCapacitacion);

module.exports = router;
