const express = require("express");
const router = express.Router();
const {
  obtenerOpciones,
  crearOpcion,
  actualizarOpcion,
  eliminarOpcion,
} = require("../controllers/opciones.controller");

// Obtener opciones por pregunta
router.get("/:id_pregunta", obtenerOpciones);

// Crear nueva opción
router.post("/", crearOpcion);

// Actualizar opción
router.put("/actualizar/:id_opcion", actualizarOpcion);

// Eliminar opción (lógica)
router.patch("/eliminar/:id_opcion", eliminarOpcion);

module.exports = router;
