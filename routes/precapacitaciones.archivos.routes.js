const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");
const { subirArchivoPDF } = require("../controllers/precapacitaciones.archivos.controller");

router.post("/subir", upload.single("archivo"), subirArchivoPDF);

module.exports = router;
