const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");
const path = require("path");

/**
 * Subir archivo PDF a una pre-capacitación
 */
const subirArchivoPDF = async (req, res) => {
  const { id_capacitacion, id_empresa, id_admin } = req.body;

  if (!req.file || !id_capacitacion || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan datos o archivo." });
  }

  const url_archivo = `/uploads/pdfs/${req.file.filename}`;
  const nombre_original = req.file.originalname;

  try {
    await pool.query(
      `INSERT INTO pre_capacitaciones_archivos 
       (id_capacitacion, id_empresa, url_archivo, nombre_original)
       VALUES ($1, $2, $3, $4)`,
      [id_capacitacion, id_empresa, url_archivo, nombre_original]
    );

    await registrarBitacora(id_admin, id_empresa, "SUBIR_PDF_CAPACITACION",
      `Se subió el archivo '${nombre_original}' a la capacitación ID ${id_capacitacion}`);

    res.status(201).json({ message: "Archivo subido correctamente.", url: url_archivo });
  } catch (error) {
    await registrarError("error", error.message, "subirArchivoPDF");
    res.status(500).json({ error: "Error al guardar el archivo en base de datos." });
  }
};


module.exports = {
    subirArchivoPDF,
}