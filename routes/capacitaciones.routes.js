const express = require("express");
const router = express.Router();
const { activarCapacitacion,
    vistaPreviaCapacitacionEmpleado,
    listarIntentosPorCapacitacion,
    obtenerArchivosCapacitacion,
    resolverCuestionario
 } = require("../controllers/capacitaciones.controller");

// Activar una capacitación real desde una plantilla
router.post("/activar/:id_capacitacion", activarCapacitacion);

// Vista previoa de las capacitaciones
router.get("/vista-previa/:id_asignacion", vistaPreviaCapacitacionEmpleado);

// Listar Capacitacion
router.get("/admin/capacitaciones/:id_capacitacion/intentos",listarIntentosPorCapacitacion);

// Obtener los archivos
router.get("/:id_capacitacion/archivos", obtenerArchivosCapacitacion);

// Resolver Cuesionario
router.get("/resolver/:id_asignacion", resolverCuestionario);


module.exports = router;
