const express = require("express");
const router = express.Router();
const {
  cambiarClave,
} = require("../controllers/usuarios.controller");

const { importarEmpleados } = require("../controllers/usuarios.controller");
const { obtenerEmpleadosConFiltros } = require("../controllers/usuarios.controller");

// Rutas principales del CRUD

router.patch("/:id/clave", cambiarClave); // Cambiar solo la contraseña del usuario

router.post("/importar-empleados", importarEmpleados); // Importa los empleados desde  CSV
router.get("/filtrar", obtenerEmpleadosConFiltros); // Obtener los empleados con filtro de estado y nomnbre - apellido

module.exports = router;
