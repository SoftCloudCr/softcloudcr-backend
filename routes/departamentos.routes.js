const express = require("express");
const router = express.Router();
const {
  crearDepartamento,
  obtenerDepartamentos,
  actualizarDepartamento,
  eliminarDepartamento
} = require("../controllers/departamentos.controller");

// Crear nuevo departamento
router.post("/crear", crearDepartamento);

// Obtener todos los departamentos de una empresa
router.get("/empresa/:id_empresa", obtenerDepartamentos);

// Actualizar departamento
router.put("/actualizar/:id_departamento", actualizarDepartamento);

// Eliminar (soft delete) departamento
router.delete("/eliminar/:id_departamento", eliminarDepartamento);

module.exports = router;
