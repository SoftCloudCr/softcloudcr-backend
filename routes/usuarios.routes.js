const express = require("express");
const router = express.Router();
const {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarClave,
} = require("../controllers/usuarios.controller");

// Rutas principales del CRUD
router.get("/", obtenerUsuarios);         // Obtener todos los usuarios
router.post("/", crearUsuario);           // Crear un nuevo usuario
router.put("/:id", actualizarUsuario);    // Actualizar un usuario
router.delete("/:id", eliminarUsuario);   // Eliminar un usuario
router.patch("/:id/clave", cambiarClave); // Cambiar solo la contraseña del usuario


module.exports = router;
