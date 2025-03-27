// controllers/capacitaciones.controller.js

const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Activa una capacitación real basada en una plantilla (pre_capacitaciones)
 * Clona el cuestionario, preguntas, opciones y asigna automáticamente a los empleados
 */
const activarCapacitacion = async (req, res) => {
  const { id_capacitacion } = req.params;
  const { id_empresa, id_admin, fecha_inicio, fecha_limite } = req.body;

  if (!id_empresa || !id_admin || !fecha_inicio || !fecha_limite) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Obtener la plantilla
    const plantilla = await client.query(
      `SELECT * FROM pre_capacitaciones WHERE id_capacitacion = $1 AND id_empresa = $2 AND estado = true AND borrador = false`,
      [id_capacitacion, id_empresa]
    );

    if (plantilla.rowCount === 0) {
      return res.status(404).json({ error: "Plantilla no encontrada o no activa." });
    }

    const datos = plantilla.rows[0];

    // Validar que el cuestionario esté activo y publicado
    const cuestionarioBase = await client.query(
      `SELECT * FROM cuestionarios_catalogo WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true AND borrador = false`,
      [datos.id_cuestionario, id_empresa]
    );

    if (cuestionarioBase.rowCount === 0) {
      return res.status(400).json({ error: "El cuestionario asignado no está publicado o activo." });
    }

    // Validar departamentos asignados
    const departamentos = await client.query(
      `SELECT id_departamento FROM pre_capacitaciones_departamentos WHERE id_capacitacion = $1 AND id_empresa = $2`,
      [id_capacitacion, id_empresa]
    );

    if (departamentos.rowCount === 0) {
      return res.status(400).json({ error: "No hay departamentos asignados a esta plantilla." });
    }

    // Validar PDF si se requiere
    if (datos.requiere_pdf) {
      const archivos = await client.query(
        `SELECT * FROM pre_capacitaciones_archivos WHERE id_capacitacion = $1`,
        [id_capacitacion]
      );

      if (archivos.rowCount === 0) {
        return res.status(400).json({ error: "Debe subir al menos un PDF para activar esta capacitación." });
      }
    }

    // 2. Registrar la capacitación activa congelando los datos clave
    const nuevaCapacitacion = await client.query(
      `INSERT INTO capacitaciones_activas (
        id_empresa, nombre, objetivo_estrategico, requiere_pdf, fecha_creacion,
        fecha_inicio, fecha_limite, estado, borrador, fecha_activacion
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, 'activa', false, CURRENT_TIMESTAMP)
      RETURNING id_capacitacion`,
      [
        id_empresa,
        datos.nombre,
        datos.objetivo_estrategico,
        datos.requiere_pdf,
        fecha_inicio,
        fecha_limite
      ]
    );

    const idCapacitacionActiva = nuevaCapacitacion.rows[0].id_capacitacion;

    // 3. Clonar cuestionario
    const cuestionarioNuevo = await client.query(
      `INSERT INTO cuestionarios_usuarios (id_capacitacion, id_empresa, nombre, intentos_permitidos, fecha_creacion)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`,
      [idCapacitacionActiva, id_empresa, cuestionarioBase.rows[0].nombre, cuestionarioBase.rows[0].intentos_permitidos]
    );

    const idCuestionarioNuevo = cuestionarioNuevo.rows[0].id_cuestionario_usuario;

    // 4. Clonar preguntas y opciones
    const preguntasBase = await client.query(
      `SELECT * FROM preguntas_catalogo WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true`,
      [datos.id_cuestionario, id_empresa]
    );

    for (const pregunta of preguntasBase.rows) {
      const nuevaPregunta = await client.query(
        `INSERT INTO preguntas_usuarios (id_cuestionario_usuario, id_empresa, tipo, texto, url_imagen, estado)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id_pregunta_usuario`,
        [idCuestionarioNuevo, id_empresa, pregunta.tipo, pregunta.texto, pregunta.url_imagen]
      );

      const idPreguntaNueva = nuevaPregunta.rows[0].id_pregunta_usuario;

      const opciones = await client.query(
        `SELECT * FROM opciones_catalogo WHERE id_pregunta = $1 AND id_empresa = $2 AND estado = true`,
        [pregunta.id_pregunta, id_empresa]
      );

      for (const opcion of opciones.rows) {
        await client.query(
          `INSERT INTO opciones_usuarios (id_pregunta_usuario, id_empresa, texto, es_correcta, estado)
           VALUES ($1, $2, $3, $4, true)`,
          [idPreguntaNueva, id_empresa, opcion.texto, opcion.es_correcta]
        );
      }
    }

    // 5. Asignar empleados de departamentos
    const empleados = await client.query(
      `SELECT DISTINCT u.id_usuario FROM usuarios u
       INNER JOIN usuarios_departamentos ud ON u.id_usuario = ud.id_usuario
       WHERE ud.id_departamento IN (${departamentos.rows.map((_, i) => `$${i + 1}`).join(",")})
       AND u.id_empresa = $${departamentos.rows.length + 1} AND u.id_rol = 2`,
      [...departamentos.rows.map(d => d.id_departamento), id_empresa]
    );

    for (const emp of empleados.rows) {
      await client.query(
        `INSERT INTO usuarios_capacitaciones (id_capacitacion, id_usuario, id_empresa, estado)
         VALUES ($1, $2, $3, 'pendiente')`,
        [idCapacitacionActiva, emp.id_usuario, id_empresa]
      );
    }

    await client.query("COMMIT");

    await registrarBitacora(id_admin, id_empresa, "ACTIVAR_CAPACITACION", `Se activó capacitación ID ${idCapacitacionActiva} desde plantilla ${id_capacitacion}`);

    res.status(201).json({ message: "Capacitación activada correctamente." });
  } catch (error) {
    await client.query("ROLLBACK");
    await registrarError("error", error.message, "activarCapacitacion");
    res.status(500).json({ error: "Error al activar la capacitación." });
  } finally {
    client.release();
  }
};

module.exports = {
  activarCapacitacion,
};
