const express = require("express");
const router = express.Router();
const {
  asociarEmpleadoADepartamento,
  eliminarEmpleadoDeDepartamento,
  obtenerEmpleadosPorDepartamento,
  obtenerDepartamentosPorEmpleado
} = require("../controllers/departamentos.empleados.controller");

// Asignar empleado
router.post("/asociar", asociarEmpleadoADepartamento);

// Eliminar asociación
router.delete("/eliminar", eliminarEmpleadoDeDepartamento);

// Obtener empleados por departamento
router.get("/listar/:id_departamento/:id_empresa", obtenerEmpleadosPorDepartamento);

// Obtener Departamentos por empleado
router.get("/empleado/:id_usuario/:id_empresa", obtenerDepartamentosPorEmpleado);

module.exports = router;
