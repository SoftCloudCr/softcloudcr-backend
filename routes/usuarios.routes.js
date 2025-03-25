const express = require("express");
const router = express.Router();
const {
  cambiarClave,
  importarEmpleados,
  obtenerEmpleadosConFiltros,
  actualizarEmpleado,
  cambiarEstadoEmpleado,
} = require("../controllers/usuarios.controller");



// Rutas principales del CRUD

router.patch("/:id/clave", cambiarClave); // Cambiar solo la contraseña del usuario
router.put("/:id/actualizar", actualizarEmpleado);
router.post("/importar-empleados", importarEmpleados); // Importa los empleados desde  CSV
router.get("/filtrar", obtenerEmpleadosConFiltros); // Obtener los empleados con filtro de estado y nomnbre - apellido
router.patch("/:id/estado", cambiarEstadoEmpleado);



module.exports = router;
