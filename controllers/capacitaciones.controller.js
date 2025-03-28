// controllers/capacitaciones.controller.js

const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Activa una capacitación real basada en una plantilla (pre_capacitaciones)
 * Clona el cuestionario, preguntas, opciones y asigna automáticamente a los empleados
 */
const activarCapacitacion = async (req, res) => {
    const { id_capacitacion } = req.params;
    const { id_empresa, id_admin, fecha_inicio, fecha_limite, nota_minima } = req.body;
  
    // Validación de campos obligatorios
    if (!id_empresa || !id_admin || !fecha_inicio || !fecha_limite || nota_minima === undefined) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }
  
    // Validación de fechas
    if (new Date(fecha_limite) < new Date(fecha_inicio)) {
      return res.status(400).json({ error: "La fecha límite no puede ser anterior a la fecha de inicio." });
    }
  
    // Validación de nota mínima
    const nota = parseFloat(nota_minima);
    if (isNaN(nota) || nota < 0 || nota > 100) {
      return res.status(400).json({ error: "La nota mínima debe estar entre 0 y 100." });
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
  
      // Validar cuestionario
      const cuestionarioBase = await client.query(
        `SELECT * FROM cuestionarios_catalogo WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true AND borrador = false`,
        [datos.id_cuestionario, id_empresa]
      );
      if (cuestionarioBase.rowCount === 0) {
        return res.status(400).json({ error: "El cuestionario asignado no está publicado o activo." });
      }
  
      // Validar departamentos
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
  
      // 2. Insertar capacitación activa con la nota mínima
      const nuevaCapacitacion = await client.query(
        `INSERT INTO capacitaciones_activas (
          id_empresa, nombre, objetivo_estrategico, requiere_pdf, fecha_creacion,
          fecha_inicio, fecha_limite, nota_minima, estado, borrador, fecha_activacion
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7, 'activa', false, CURRENT_TIMESTAMP)
        RETURNING id_capacitacion`,
        [
          id_empresa,
          datos.nombre,
          datos.objetivo_estrategico,
          datos.requiere_pdf,
          fecha_inicio,
          fecha_limite,
          nota
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

    // 5. Asignar empleados de departamentos y registrar relación histórica
    const empleados = await client.query(
      `SELECT DISTINCT u.id_usuario, ud.id_departamento FROM usuarios u
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

      await client.query(
        `INSERT INTO capacitacion_departamento_usuario (id_empresa, id_capacitacion, id_departamento, id_usuario)
         VALUES ($1, $2, $3, $4)`,
        [id_empresa, idCapacitacionActiva, emp.id_departamento, emp.id_usuario]
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

// *****
// Vsta Previa de las capacitaciones
// *****
const vistaPreviaCapacitacionEmpleado = async (req, res) => {
  const { id_asignacion } = req.params;

  if (!id_asignacion) {
    return res.status(400).json({ error: "Falta el id_asignacion." });
  }

  try {
    // 1. Obtener la asignación, capacitación y cuestionario vinculado
    const result = await pool.query(`
      SELECT 
        ca.nombre,
        ca.objetivo_estrategico,
        ca.fecha_inicio,
        ca.fecha_limite,
        ca.nota_minima,
        ca.requiere_pdf,
        cu.intentos_permitidos,
        uc.estado AS estado_asignacion
      FROM usuarios_capacitaciones uc
      INNER JOIN capacitaciones_activas ca ON ca.id_capacitacion = uc.id_capacitacion
      INNER JOIN cuestionarios_usuarios cu ON cu.id_capacitacion = ca.id_capacitacion
      WHERE uc.id_asignacion = $1
    `, [id_asignacion]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Asignación no encontrada." });
    }

    const datos = result.rows[0];

    // 2. Contar intentos realizados
    const intentos = await pool.query(`
      SELECT COUNT(*) FROM intentos_cuestionario
      WHERE id_asignacion = $1
    `, [id_asignacion]);

    const intentos_realizados = parseInt(intentos.rows[0].count);

    // 3. Obtener PDF si existen
    let archivos_pdf = [];
    if (datos.requiere_pdf) {
      const archivos = await pool.query(`
        SELECT id_archivo, nombre_original, url_archivo
        FROM pre_capacitaciones_archivos
        WHERE id_capacitacion = (
          SELECT id_capacitacion FROM usuarios_capacitaciones WHERE id_asignacion = $1
        )
      `, [id_asignacion]);

      archivos_pdf = archivos.rows;
    }

    // 4. Armar respuesta
    return res.status(200).json({
      nombre: datos.nombre,
      objetivo_estrategico: datos.objetivo_estrategico,
      fecha_inicio: datos.fecha_inicio,
      fecha_limite: datos.fecha_limite,
      nota_minima: datos.nota_minima,
      requiere_pdf: datos.requiere_pdf,
      archivos_pdf,
      intentos_permitidos: datos.intentos_permitidos,
      intentos_realizados,
      estado_asignacion: datos.estado_asignacion
    });

  } catch (error) {
    await registrarError("error", error.message, "vistaPreviaCapacitacionEmpleado");
    return res.status(500).json({ error: "Error al obtener vista previa de la capacitación." });
  }
};





module.exports = {
  activarCapacitacion,
  vistaPreviaCapacitacionEmpleado,
};
