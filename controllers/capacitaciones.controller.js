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

      // 2.1 Clonar archivos PDF de la plantilla (si requiere_pdf está activo)
if (datos.requiere_pdf) {
  const archivosPlantilla = await client.query(
    `SELECT nombre_original, url_archivo,id_empresa
     FROM pre_capacitaciones_archivos
     WHERE id_capacitacion = $1`,
    [id_capacitacion]
  );

  for (const archivo of archivosPlantilla.rows) {
    await client.query(
      `INSERT INTO capacitaciones_activas_archivos (id_capacitacion,id_empresa, nombre_original, url_archivo)
       VALUES ($1, $2, $3, $4)`,
      [idCapacitacionActiva,archivo.id_empresa, archivo.nombre_original, archivo.url_archivo]
    );
  }
}

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
        FROM capacitaciones_activas_archivos
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

// controllers/capacitaciones.controller.js

const listarIntentosPorCapacitacion = async (req, res) => {
  const { id_capacitacion } = req.params;
  const { id_empresa } = req.body;

 
  if (!id_capacitacion || !id_empresa) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  try {
    // Validar que la capacitación exista
    const capacitacion = await pool.query(
      `SELECT * FROM capacitaciones_activas
       WHERE id_capacitacion = $1 AND id_empresa = $2`,
      [id_capacitacion, id_empresa]
    );

    if (capacitacion.rowCount === 0) {
      return res.status(404).json({ error: "Capacitación no encontrada." });
    }

    // Traer los intentos de esa capacitación
    const intentos = await pool.query(
      `SELECT 
         i.id_intento,
         u.id_usuario,
         u.nombre AS nombre_usuario,
         d.nombre AS departamento,
         i.nota,
         i.aprobado,
         i.fecha_intento
       FROM intentos_cuestionario i
       INNER JOIN usuarios_capacitaciones uc ON uc.id_asignacion = i.id_asignacion
       INNER JOIN usuarios u ON u.id_usuario = uc.id_usuario
       INNER JOIN capacitacion_departamento_usuario cdu ON cdu.id_usuario = u.id_usuario 
         AND cdu.id_capacitacion = uc.id_capacitacion
       INNER JOIN departamentos d ON d.id_departamento = cdu.id_departamento
       WHERE uc.id_capacitacion = $1 AND i.id_empresa = $2
       ORDER BY i.fecha_intento DESC`,
      [id_capacitacion, id_empresa]
    );

    res.status(200).json(intentos.rows);
  } catch (error) {
    await registrarError("error", error.message, "listarIntentosPorCapacitacion");
    res.status(500).json({ error: "Error al listar intentos." });
  }
};


/**
 * Obtener los archivos PDF asociados a una capacitación activa (clonados al momento de activación)
 */
const obtenerArchivosCapacitacion = async (req, res) => {
  const { id_capacitacion } = req.params;
  const { id_empresa } = req.query;

  if (!id_empresa) {
    return res.status(400).json({ error: "Falta el parámetro id_empresa." });
  }

  try {
    // Verificar que exista la capacitación activa
    const resultado = await pool.query(
      `SELECT * FROM capacitaciones_activas
       WHERE id_capacitacion = $1 AND id_empresa = $2`,
      [id_capacitacion, id_empresa]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: "Capacitación activa no encontrada." });
    }

    // Obtener los archivos PDF clonados
    const archivos = await pool.query(
      `SELECT id_archivo,id_empresa, nombre_original, url_archivo
       FROM capacitaciones_activas_archivos
       WHERE id_capacitacion = $1`,
      [id_capacitacion]
    );

    res.status(200).json({ archivos: archivos.rows });
  } catch (error) {
    await registrarError("error", error.message, "obtenerArchivosCapacitacion");
    res.status(500).json({ error: "Error al obtener los archivos de la capacitación." });
  }
};
//***********
// Resolver Cuesionario 
// *****

const resolverCuestionario = async (req, res) => {
  const { id_asignacion } = req.params;
  const { id_empresa, id_usuario } = req.query;

  if (!id_empresa || !id_usuario) {
    return res.status(400).json({ error: "Faltan parámetros obligatorios." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verificar la asignación y obtener datos
    const asignacion = await client.query(
      `SELECT a.estado, c.fecha_inicio, c.fecha_limite, cu.id_cuestionario_usuario, cu.intentos_permitidos
       FROM usuarios_capacitaciones a
       INNER JOIN capacitaciones_activas c ON c.id_capacitacion = a.id_capacitacion
       INNER JOIN cuestionarios_usuarios cu ON cu.id_capacitacion = c.id_capacitacion
       WHERE a.id_asignacion = $1 AND a.id_empresa = $2 AND a.id_usuario = $3`,
      [id_asignacion, id_empresa, id_usuario]
    );

    if (asignacion.rowCount === 0) {
      return res.status(404).json({ error: "Asignación no encontrada." });
    }

    const datos = asignacion.rows[0];

    // 2. Validar estado y rango de fechas
    const ahora = new Date();
    const inicio = new Date(datos.fecha_inicio);
    const limite = new Date(datos.fecha_limite);

    if (datos.estado !== "pendiente") {
      return res.status(400).json({ error: "Ya completaste esta capacitación o no está disponible." });
    }

    if (ahora < inicio) {
      return res.status(400).json({ error: "La capacitación aún no ha iniciado." });
    }

    if (ahora > limite) {
      return res.status(400).json({ error: "La capacitación ha vencido." });
    }

    // 3. Verificar intentos realizados
    const intentos = await client.query(
      `SELECT COUNT(*) FROM intentos_cuestionario
       WHERE id_asignacion = $1 AND id_empresa = $2`,
      [id_asignacion, id_empresa]
    );

    const hechos = parseInt(intentos.rows[0].count);
    if (hechos >= datos.intentos_permitidos) {
      return res.status(403).json({ error: "Ya alcanzaste el límite de intentos permitidos." });
    }

    // 4. Obtener preguntas y opciones
    const preguntas = await client.query(
      `SELECT p.id_pregunta_usuario AS id_pregunta, p.tipo, p.texto, p.url_imagen
       FROM preguntas_usuarios p
       WHERE p.id_cuestionario_usuario = $1 AND p.id_empresa = $2 AND p.estado = true`,
      [datos.id_cuestionario_usuario, id_empresa]
    );

    const resultado = [];

    for (const pregunta of preguntas.rows) {
      const opciones = await client.query(
        `SELECT id_opcion_usuario AS id_opcion, texto
         FROM opciones_usuarios
         WHERE id_pregunta_usuario = $1 AND id_empresa = $2 AND estado = true`,
        [pregunta.id_pregunta, id_empresa]
      );

      resultado.push({
        ...pregunta,
        opciones: opciones.rows,
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      id_cuestionario: datos.id_cuestionario_usuario,
      preguntas: resultado,
    });

  } catch (error) {
    await client.query("ROLLBACK");
    await registrarError("error", error.message, "resolverCuestionario");
    res.status(500).json({ error: "Error al cargar el cuestionario." });
  } finally {
    client.release();
  }
};



module.exports = {
  activarCapacitacion,
  vistaPreviaCapacitacionEmpleado,
  listarIntentosPorCapacitacion,
  obtenerArchivosCapacitacion,
  resolverCuestionario,
};
