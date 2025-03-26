const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Obtiene las opciones activas de una pregunta
 */
const obtenerOpciones = async (req, res) => {
  const { id_pregunta } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM opciones_catalogo
       WHERE id_pregunta = $1 AND estado = true`,
      [id_pregunta]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerOpciones");
    res.status(500).json({ error: "Error al obtener las opciones." });
  }
};

/**
 * Crea una nueva opción de respuesta
 */
const crearOpcion = async (req, res) => {
  const { id_pregunta, id_empresa, texto, es_correcta, id_admin } = req.body;

  if (!id_pregunta || !id_empresa || texto == null || es_correcta == null || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Obtener tipo de pregunta
    const pregunta = await pool.query(
      `SELECT * FROM preguntas_catalogo WHERE id_pregunta = $1 AND id_empresa = $2 AND estado = true`,
      [id_pregunta, id_empresa]
    );

    if (pregunta.rowCount === 0) {
      return res.status(404).json({ error: "Pregunta no encontrada o inactiva." });
    }

    const tipo = pregunta.rows[0].tipo;
    const id_cuestionario = pregunta.rows[0].id_cuestionario;

    // Si es opción correcta y la pregunta es de tipo única, validar que no exista ya otra correcta
    if (es_correcta && tipo === "unica") {
      const validacion = await pool.query(
        `SELECT * FROM opciones_catalogo
         WHERE id_pregunta = $1 AND id_empresa = $2 AND es_correcta = true AND estado = true`,
        [id_pregunta, id_empresa]
      );

      if (validacion.rowCount > 0) {
        return res.status(400).json({
          error: "Ya existe una opción correcta para esta pregunta de tipo única."
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO opciones_catalogo (id_pregunta, id_empresa, texto, es_correcta, estado)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [id_pregunta, id_empresa, texto, es_correcta]
    );

    // Marcar el cuestionario como borrador
    await pool.query(
      `UPDATE cuestionarios_catalogo SET borrador = true
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [id_cuestionario, id_empresa]
    );

    const accion = "CREAR_OPCION";
    const detalle = `Se creó una opción para la pregunta ID ${id_pregunta}: "${texto}" (${es_correcta ? "Correcta" : "Incorrecta"})`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await registrarError("error", error.message, "crearOpcion");
    res.status(500).json({ error: "Error al crear la opción." });
  }
};

/**
 * Actualiza una opción de respuesta
 */
const actualizarOpcion = async (req, res) => {
  const { id_opcion } = req.params;
  const { texto, es_correcta, id_empresa, id_admin } = req.body;

  if (!texto || es_correcta == null || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Obtener opción anterior
    const opcionPrev = await pool.query(
      `SELECT * FROM opciones_catalogo WHERE id_opcion = $1 AND id_empresa = $2 AND estado = true`,
      [id_opcion, id_empresa]
    );

    if (opcionPrev.rowCount === 0) {
      return res.status(404).json({ error: "Opción no encontrada o inactiva." });
    }

    const opcion = opcionPrev.rows[0];
    const id_pregunta = opcion.id_pregunta;

    // Obtener tipo de pregunta
    const pregunta = await pool.query(
      `SELECT * FROM preguntas_catalogo WHERE id_pregunta = $1 AND id_empresa = $2`,
      [id_pregunta, id_empresa]
    );

    const tipo = pregunta.rows[0].tipo;
    const id_cuestionario = pregunta.rows[0].id_cuestionario;

    // Validar que no queden múltiples correctas en tipo única
    if (es_correcta && tipo === "unica") {
      const validacion = await pool.query(
        `SELECT * FROM opciones_catalogo
         WHERE id_pregunta = $1 AND id_empresa = $2 AND es_correcta = true AND estado = true AND id_opcion != $3`,
        [id_pregunta, id_empresa, id_opcion]
      );

      if (validacion.rowCount > 0) {
        return res.status(400).json({
          error: "Ya existe otra opción correcta para esta pregunta de tipo única."
        });
      }
    }

    await pool.query(
      `UPDATE opciones_catalogo
       SET texto = $1, es_correcta = $2
       WHERE id_opcion = $3 AND id_empresa = $4`,
      [texto, es_correcta, id_opcion, id_empresa]
    );

    // Marcar cuestionario como borrador
    await pool.query(
      `UPDATE cuestionarios_catalogo SET borrador = true
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [id_cuestionario, id_empresa]
    );

    const accion = "ACTUALIZAR_OPCION";
    const detalle = `Se actualizó la opción ID ${id_opcion}: "${opcion.texto}" → "${texto}"`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: "Opción actualizada correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "actualizarOpcion");
    res.status(500).json({ error: "Error al actualizar la opción." });
  }
};

/**
 * Elimina lógicamente una opción
 */
const eliminarOpcion = async (req, res) => {
  const { id_opcion } = req.params;
  const { id_empresa, id_admin } = req.body;

  if (!id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  try {
    const opcion = await pool.query(
      `SELECT * FROM opciones_catalogo WHERE id_opcion = $1 AND id_empresa = $2`,
      [id_opcion, id_empresa]
    );

    if (opcion.rowCount === 0) {
      return res.status(404).json({ error: "Opción no encontrada." });
    }

    const id_pregunta = opcion.rows[0].id_pregunta;

    // Obtener id_cuestionario desde la pregunta
    const pregunta = await pool.query(
      `SELECT * FROM preguntas_catalogo WHERE id_pregunta = $1 AND id_empresa = $2`,
      [id_pregunta, id_empresa]
    );

    const id_cuestionario = pregunta.rows[0].id_cuestionario;

    await pool.query(
      `UPDATE opciones_catalogo SET estado = false
       WHERE id_opcion = $1 AND id_empresa = $2`,
      [id_opcion, id_empresa]
    );

    await pool.query(
      `UPDATE cuestionarios_catalogo SET borrador = true
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [id_cuestionario, id_empresa]
    );

    const accion = "ELIMINAR_OPCION";
    const detalle = `Se eliminó la opción ID ${id_opcion}: "${opcion.rows[0].texto}"`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: "Opción eliminada correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "eliminarOpcion");
    res.status(500).json({ error: "Error al eliminar la opción." });
  }
};

module.exports = {
  obtenerOpciones,
  crearOpcion,
  actualizarOpcion,
  eliminarOpcion,
};
