const express = require("express");
const router = express.Router();
const {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios.controller");

// Rutas principales del CRUD
router.get("/", obtenerUsuarios);         // Obtener todos los usuarios
router.post("/", crearUsuario);           // Crear un nuevo usuario
router.put("/:id", actualizarUsuario);    // Actualizar un usuario
router.delete("/:id", eliminarUsuario);   // Eliminar un usuario

module.exports = router;
