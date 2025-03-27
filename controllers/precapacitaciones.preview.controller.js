const pool = require("../models/db");
const { registrarError } = require("../utils/logger");

/**
 * Genera la vista previa de una plantilla de capacitación
 */
const vistaPreviaCapacitacion = async (req, res) => {
  const { id_capacitacion } = req.params;
  const { id_empresa } = req.query;

  if (!id_empresa) {
    return res.status(400).json({ error: "Falta el parámetro id_empresa." });
  }

  try {
    // Obtener info base de la plantilla
    const plantilla = await pool.query(
      `SELECT nombre, objetivo_estrategico, descripcion, id_cuestionario
       FROM pre_capacitaciones
       WHERE id_capacitacion = $1 AND id_empresa = $2 AND estado = true`,
      [id_capacitacion, id_empresa]
    );

    if (plantilla.rowCount === 0) {
      return res.status(404).json({ error: "Plantilla no encontrada o inactiva." });
    }

    const datos = plantilla.rows[0];

    // PDFs adjuntos
    const archivos = await pool.query(
      `SELECT url_archivo, nombre_original
       FROM pre_capacitaciones_archivos
       WHERE id_capacitacion = $1 AND id_empresa = $2`,
      [id_capacitacion, id_empresa]
    );

    // Cuestionario
    const cuestionario = await pool.query(
      `SELECT nombre, descripcion, intentos_permitidos
       FROM cuestionarios_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true AND borrador = false`,
      [datos.id_cuestionario, id_empresa]
    );

    if (cuestionario.rowCount === 0) {
      return res.status(400).json({ error: "El cuestionario está en borrador o inactivo." });
    }

    const infoCuestionario = cuestionario.rows[0];

    // Preguntas
    const preguntasRaw = await pool.query(
      `SELECT id_pregunta, texto, tipo, url_imagen
       FROM preguntas_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true
       ORDER BY id_pregunta ASC`,
      [datos.id_cuestionario, id_empresa]
    );

    const preguntas = [];

    for (const pregunta of preguntasRaw.rows) {
      const opciones = await pool.query(
        `SELECT id_opcion, texto
         FROM opciones_catalogo
         WHERE id_pregunta = $1 AND id_empresa = $2 AND estado = true
         ORDER BY id_opcion ASC`,
        [pregunta.id_pregunta, id_empresa]
      );

      preguntas.push({
        id_pregunta: pregunta.id_pregunta,
        texto: pregunta.texto,
        tipo: pregunta.tipo,
        url_imagen: pregunta.url_imagen || null,
        opciones: opciones.rows
      });
    }

    res.status(200).json({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      objetivo_estrategico: datos.objetivo_estrategico,
      archivos: archivos.rows,
      cuestionario: {
        titulo: infoCuestionario.nombre,
        descripcion: infoCuestionario.descripcion,
        intentos_permitidos: infoCuestionario.intentos_permitidos,
        preguntas
      }
    });

  } catch (error) {
    await registrarError("error", error.message, "vistaPreviaCapacitacion");
    res.status(500).json({ error: "Error al generar vista previa." });
  }
};


module.exports = {
    vistaPreviaCapacitacion,
}