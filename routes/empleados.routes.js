const express = require("express");
const router = express.Router();
const {obtenerCapacitacionesAsignadas
       ,listarCapacitacionesPendientes
      } = require("../controllers/empleados.controller");

router.get("/capacitaciones/:id_usuario/:id_empresa", obtenerCapacitacionesAsignadas);
router.get("/capacitaciones/pendientes/:id_usuario/:id_empresa", listarCapacitacionesPendientes);

module.exports = router;
