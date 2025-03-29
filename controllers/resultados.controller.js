    // controllers/resultados.controller.js

const pool = require("../models/db");
const { registrarError } = require("../utils/logger");

const obtenerResultadoPorAsignacion = async (req, res) => {
  const { id_asignacion } = req.params;
  const { id_empresa } = req.query;

  if (!id_asignacion || !id_empresa) {
    return res.status(400).json({ error: "Faltan parámetros requeridos." });
  }

  try {
    // 1. Validar que la asignación exista
    const asignacion = await pool.query(
      `SELECT a.id_capacitacion, c.id_cuestionario_usuario
       FROM usuarios_capacitaciones a
       INNER JOIN cuestionarios_usuarios c ON c.id_capacitacion = a.id_capacitacion
       WHERE a.id_asignacion = $1 AND a.id_empresa = $2`,
      [id_asignacion, id_empresa]
    );

    if (asignacion.rowCount === 0) {
      return res.status(404).json({ error: "Asignación no encontrada." });
    }

    const { id_capacitacion, id_cuestionario_usuario } = asignacion.rows[0];

    // 2. Obtener resultado actual
    const resultado = await pool.query(
      `SELECT nota, aprobado, fecha_registro
       FROM resultados_cuestionario
       WHERE id_usuario_capacitacion = $1 AND id_empresa = $2`,
      [id_asignacion, id_empresa]
    );

    // 3. Obtener intentos hechos y permitidos
    const intentosTotales = await pool.query(
      `SELECT COUNT(*) FROM intentos_cuestionario
       WHERE id_asignacion = $1 AND id_empresa = $2`,
      [id_asignacion, id_empresa]
    );

    const config = await pool.query(
      `SELECT intentos_permitidos FROM cuestionarios_usuarios
       WHERE id_cuestionario_usuario = $1 AND id_empresa = $2`,
      [id_cuestionario_usuario, id_empresa]
    );

    const intentos_hechos = parseInt(intentosTotales.rows[0].count);
    const intentos_permitidos = config.rows[0]?.intentos_permitidos ?? 1;

    if (resultado.rowCount === 0) {
      return res.status(200).json({
        nota: null,
        aprobado: false,
        fecha_registro: null,
        intentos_totales: intentos_hechos,
        intentos_permitidos,
        mensaje: "Aún no has completado el cuestionario."
      });
    }

    const { nota, aprobado, fecha_registro } = resultado.rows[0];

    res.status(200).json({
      nota,
      aprobado,
      fecha_registro,
      intentos_totales: intentos_hechos,
      intentos_permitidos,
      mensaje: aprobado
        ? "¡Felicidades! Aprobaste la capacitación."
        : "Sigue intentando para aprobar la capacitación."
    });
  } catch (error) {
    await registrarError("error", error.message, "obtenerResultadoPorAsignacion");
    res.status(500).json({ error: "Error al obtener los resultados." });
  }
};

module.exports = {
  obtenerResultadoPorAsignacion,
};
