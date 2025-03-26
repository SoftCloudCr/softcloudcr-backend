const express = require("express");
const router = express.Router();
const {
  obtenerCuestionarios,
  crearCuestionario,
  actualizarCuestionario,
  eliminarCuestionario,
  cambiarEstadoCuestionario
} = require("../controllers/cuestionarios.controller");

// Obtener todos los cuestionarios de una empresa
router.get("/:id_empresa", obtenerCuestionarios);

// Crear un nuevo cuestionario
router.post("/", crearCuestionario);

// Actualizar cuestionario existente
router.put("/actualizar/:id_cuestionario", actualizarCuestionario);
// Actualizar el estado del cuestionario 
router.patch("/estado/:id_cuestionario", cambiarEstadoCuestionario    );

// Eliminar cuestionario
router.delete("/eliminar/:id_cuestionario", eliminarCuestionario);

module.exports = router;
