const express = require("express");
const router = express.Router();
const {
  obtenerPreguntas,
  crearPregunta,
  actualizarPregunta,
  eliminarPregunta,
} = require("../controllers/preguntas.controller");

// Obtener preguntas por cuestionario
router.get("/:id_cuestionario", obtenerPreguntas);

// Crear pregunta
router.post("/", crearPregunta);

// Actualizar pregunta
router.put("/actualizar/:id_pregunta", actualizarPregunta);

// Eliminar pregunta (lógico)
router.patch("/eliminar/:id_pregunta", eliminarPregunta);

module.exports = router;
