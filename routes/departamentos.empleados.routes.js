const express = require("express");
const router = express.Router();
const {
  asociarEmpleadoADepartamento,
  eliminarEmpleadoDeDepartamento,
  obtenerEmpleadosPorDepartamento
} = require("../controllers/departamentos.empleados.controller");

// Asignar empleado
router.post("/asociar", asociarEmpleadoADepartamento);

// Eliminar asociación
router.delete("/eliminar", eliminarEmpleadoDeDepartamento);

// Obtener empleados por departamento
router.get("/listar/:id_departamento/:id_empresa", obtenerEmpleadosPorDepartamento);

module.exports = router;
    