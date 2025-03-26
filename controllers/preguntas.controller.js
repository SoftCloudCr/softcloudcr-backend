const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Obtiene todas las preguntas de un cuestionario (activas o no, según se requiera)
 */
const obtenerPreguntas = async (req, res) => {
  const { id_cuestionario } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM preguntas_catalogo
       WHERE id_cuestionario = $1 AND estado = true`,
      [id_cuestionario]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerPreguntas");
    res.status(500).json({ error: "Error al obtener las preguntas." });
  }
};

/**
 * Crea una nueva pregunta
 */
const crearPregunta = async (req, res) => {
  const { id_cuestionario, id_empresa, tipo, texto, id_admin } = req.body;

  if (!id_cuestionario || !id_empresa || !tipo || !texto || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO preguntas_catalogo (id_cuestionario, id_empresa, tipo, texto, estado)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [id_cuestionario, id_empresa, tipo, texto]
    );

    // Marcar cuestionario como borrador por seguridad
    await pool.query(
      `UPDATE cuestionarios_catalogo SET borrador = true
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [id_cuestionario, id_empresa]
    );

    const accion = "CREAR_PREGUNTA";
    const detalle = `Se creó una nueva pregunta en el cuestionario ID ${id_cuestionario}: "${texto}"`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await registrarError("error", error.message, "crearPregunta");
    res.status(500).json({ error: "Error al crear la pregunta." });
  }
};

/**
 * Actualiza una pregunta existente
 */
const actualizarPregunta = async (req, res) => {
  const { id_pregunta } = req.params;
  const { tipo, texto, id_empresa, id_admin } = req.body;

  if (!tipo || !texto || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Obtener pregunta anterior
    const previa = await pool.query(
      `SELECT * FROM preguntas_catalogo WHERE id_pregunta = $1 AND id_empresa = $2`,
      [id_pregunta, id_empresa]
    );

    if (previa.rowCount === 0) {
      return res.status(404).json({ error: "Pregunta no encontrada." });
    }

    const preguntaPrev = previa.rows[0];

    await pool.query(
      `UPDATE preguntas_catalogo
       SET tipo = $1, texto = $2
       WHERE id_pregunta = $3 AND id_empresa = $4`,
      [tipo, texto, id_pregunta, id_empresa]
    );

    // También ponemos en borrador el cuestionario por seguridad
    await pool.query(
      `UPDATE cuestionarios_catalogo SET borrador = true
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [preguntaPrev.id_cuestionario, id_empresa]
    );

    const accion = "ACTUALIZAR_PREGUNTA";
    const detalle = `Se actualizó la pregunta ID ${id_pregunta}: "${preguntaPrev.texto}" → "${texto}"`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: "Pregunta actualizada correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "actualizarPregunta");
    res.status(500).json({ error: "Error al actualizar la pregunta." });
  }
};

/**
 * Elimina lógicamente una pregunta
 */
const eliminarPregunta = async (req, res) => {
  const { id_pregunta } = req.params;
  const { id_empresa, id_admin } = req.body;

  if (!id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan datos necesarios." });
  }

  try {
    const previa = await pool.query(
      `SELECT * FROM preguntas_catalogo WHERE id_pregunta = $1 AND id_empresa = $2`,
      [id_pregunta, id_empresa]
    );

    if (previa.rowCount === 0) {
      return res.status(404).json({ error: "Pregunta no encontrada." });
    }

    await pool.query(
      `UPDATE preguntas_catalogo SET estado = false
       WHERE id_pregunta = $1 AND id_empresa = $2`,
      [id_pregunta, id_empresa]
    );

    // Marcar nuevamente el cuestionario como borrador
    await pool.query(
      `UPDATE cuestionarios_catalogo SET borrador = true
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [previa.rows[0].id_cuestionario, id_empresa]
    );

    const accion = "ELIMINAR_PREGUNTA";
    const detalle = `Se eliminó la pregunta: "${previa.rows[0].texto}" (ID ${id_pregunta})`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: "Pregunta eliminada correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "eliminarPregunta");
    res.status(500).json({ error: "Error al eliminar la pregunta." });
  }
};

module.exports = {
  obtenerPreguntas,
  crearPregunta,
  actualizarPregunta,
  eliminarPregunta,
};
