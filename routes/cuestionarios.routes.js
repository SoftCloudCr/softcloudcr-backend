const express = require("express");
const router = express.Router();
const {
  obtenerCuestionarios,
  crearCuestionario,
  actualizarCuestionario,
  eliminarCuestionario,
  cambiarEstadoCuestionario,
  publicarCuestionario,
  verificarCuestionario,
  vistaPreviaCuestionario,
  iniciarCuestionario,
  obtenerVistaCuestionarioAsignado
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

// Publicar Cuestionario
router.patch("/publicar/:id_cuestionario", publicarCuestionario);

// Verificar la integridad del cuestionario
router.get("/verificar/:id_cuestionario", verificarCuestionario);

// Vista previa
router.get("/vista-previa/:id_cuestionario", vistaPreviaCuestionario);

// iniciar su cuestionario asignado
router.get("/cuestionario/iniciar/:id_asignacion", iniciarCuestionario);

// Obtenere cuestionarios asignados

router.get("/preview/:id_asignacion", obtenerVistaCuestionarioAsignado);

module.exports = router;
