const express = require("express");
const router = express.Router();
const { vistaPreviaCapacitacion } = require("../controllers/precapacitaciones.preview.controller");

router.get("/:id_capacitacion", vistaPreviaCapacitacion);

module.exports = router;
