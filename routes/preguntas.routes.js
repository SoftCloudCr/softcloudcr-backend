const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { subirImagenPregunta } = require("../controllers/preguntas.upload.controller");
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

// Subir imagen a Cloudinary
router.post("/subir-imagen", upload.single("imagen"), subirImagenPregunta);

module.exports = router;
