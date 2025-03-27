const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Crear nueva pre-capacitación (modo borrador)
 */
const crearPreCapacitacion = async (req, res) => {
  const {
    id_empresa,
    nombre,
    descripcion,
    objetivo_estrategico,
    id_cuestionario,
    requiere_pdf,
    tipo,
    id_admin
  } = req.body;

  if (!id_empresa || !nombre || !objetivo_estrategico || !id_cuestionario || id_admin === undefined) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO pre_capacitaciones 
      (id_empresa, nombre, descripcion, objetivo_estrategico, id_cuestionario, requiere_pdf, tipo, id_admin, borrador, estado, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, CURRENT_TIMESTAMP)
      RETURNING *`,
      [id_empresa, nombre, descripcion || null, objetivo_estrategico, id_cuestionario, requiere_pdf ?? true, tipo || null, id_admin]
    );

    await registrarBitacora(id_admin, id_empresa, "CREAR_PRE_CAPACITACION", `Se creó plantilla: ${nombre}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await registrarError("error", error.message, "crearPreCapacitacion");
    res.status(500).json({ error: "Error al crear la plantilla." });
  }
};

/**
 * Editar pre-capacitación existente (siempre regresa a borrador)
 */
const actualizarPreCapacitacion = async (req, res) => {
  const { id_capacitacion } = req.params;
  const {
    id_empresa,
    nombre,
    descripcion,
    objetivo_estrategico,
    id_cuestionario,
    requiere_pdf,
    tipo,
    id_admin
  } = req.body;

  if (!id_empresa || !nombre || !objetivo_estrategico || !id_cuestionario || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const result = await pool.query(
      `UPDATE pre_capacitaciones SET
        nombre = $1,
        descripcion = $2,
        objetivo_estrategico = $3,
        id_cuestionario = $4,
        requiere_pdf = $5,
        tipo = $6,
        borrador = true
       WHERE id_capacitacion = $7 AND id_empresa = $8
       RETURNING *`,
      [nombre, descripcion || null, objetivo_estrategico, id_cuestionario, requiere_pdf ?? true, tipo || null, id_capacitacion, id_empresa]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Plantilla no encontrada." });
    }

    await registrarBitacora(id_admin, id_empresa, "EDITAR_PRE_CAPACITACION", `Se editó plantilla ID ${id_capacitacion}`);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await registrarError("error", error.message, "actualizarPreCapacitacion");
    res.status(500).json({ error: "Error al editar la plantilla." });
  }
};

/**
 * Listar todas las pre-capacitaciones de una empresa
 */
const obtenerPreCapacitaciones = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM pre_capacitaciones
       WHERE id_empresa = $1
       ORDER BY fecha_creacion DESC`,
      [id_empresa]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerPreCapacitaciones");
    res.status(500).json({ error: "Error al obtener las plantillas." });
  }
};

/**
 * Activar plantilla (validando cuestionario, PDF y departamentos)
 */
const activarPreCapacitacion = async (req, res) => {
  const { id_capacitacion } = req.params;
  const { id_empresa, id_admin } = req.body;

  if (!id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  try {
    // Obtener datos de la capacitación
    const plantilla = await pool.query(
      `SELECT * FROM pre_capacitaciones WHERE id_capacitacion = $1 AND id_empresa = $2`,
      [id_capacitacion, id_empresa]
    );

    if (plantilla.rowCount === 0) {
      return res.status(404).json({ error: "Plantilla no encontrada." });
    }

    const data = plantilla.rows[0];

    // Validar cuestionario
    const cuestionario = await pool.query(
      `SELECT * FROM cuestionarios_catalogo 
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true AND borrador = false`,
      [data.id_cuestionario, id_empresa]
    );

    if (cuestionario.rowCount === 0) {
      return res.status(400).json({ error: "El cuestionario no está activo o está incompleto." });
    }

    // Validar departamentos asociados
    const departamentos = await pool.query(
      `SELECT * FROM pre_capacitaciones_departamento WHERE id_capacitacion = $1`,
      [id_capacitacion]
    );

    if (departamentos.rowCount === 0) {
      return res.status(400).json({ error: "Debe asignar al menos un departamento." });
    }

    // Validar PDF si es obligatorio
    if (data.requiere_pdf) {
      const archivos = await pool.query(
        `SELECT * FROM pre_capacitaciones_archivos WHERE id_capacitacion = $1`,
        [id_capacitacion]
      );

      if (archivos.rowCount === 0) {
        return res.status(400).json({ error: "Debe subir al menos un PDF para activar esta plantilla." });
      }
    }

    // Activar plantilla
    await pool.query(
      `UPDATE pre_capacitaciones SET borrador = false, fecha_activacion = CURRENT_TIMESTAMP
       WHERE id_capacitacion = $1 AND id_empresa = $2`,
      [id_capacitacion, id_empresa]
    );

    await registrarBitacora(id_admin, id_empresa, "ACTIVAR_PRE_CAPACITACION", `Se activó plantilla ID ${id_capacitacion}`);
    res.status(200).json({ message: "Plantilla activada correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "activarPreCapacitacion");
    res.status(500).json({ error: "Error al activar la plantilla." });
  }
};

/**
 * Cambiar estado de una plantilla (activar o desactivar visibilidad)
 */
const cambiarEstadoPreCapacitacion = async (req, res) => {
    const { id_capacitacion } = req.params;
    const { id_empresa, id_admin, estado } = req.body;
  
    if (!id_empresa || !id_admin || typeof estado !== "boolean") {
      return res.status(400).json({ error: "Faltan datos o estado inválido." });
    }
  
    try {
      const plantilla = await pool.query(
        `SELECT * FROM pre_capacitaciones WHERE id_capacitacion = $1 AND id_empresa = $2`,
        [id_capacitacion, id_empresa]
      );
  
      if (plantilla.rowCount === 0) {
        return res.status(404).json({ error: "Plantilla no encontrada." });
      }
  
      const data = plantilla.rows[0];
  
      if (estado === true) {
        // Validar cuestionario
        const cuestionario = await pool.query(
          `SELECT * FROM cuestionarios_catalogo 
           WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true AND borrador = false`,
          [data.id_cuestionario, id_empresa]
        );
  
        if (cuestionario.rowCount === 0) {
          return res.status(400).json({ error: "El cuestionario no está activo o está en borrador." });
        }
  
        // Validar departamentos
        const departamentos = await pool.query(
          `SELECT * FROM pre_capacitaciones_departamento WHERE id_capacitacion = $1`,
          [id_capacitacion]
        );
  
        if (departamentos.rowCount === 0) {
          return res.status(400).json({ error: "Debe asignar al menos un departamento." });
        }
  
        // Validar PDF si se requiere
        if (data.requiere_pdf) {
          const archivos = await pool.query(
            `SELECT * FROM pre_capacitaciones_archivos WHERE id_capacitacion = $1`,
            [id_capacitacion]
          );
  
          if (archivos.rowCount === 0) {
            return res.status(400).json({ error: "Debe subir al menos un PDF para activar esta plantilla." });
          }
        }
  
        // Marcar que ya no es borrador al activarse
        await pool.query(
          `UPDATE pre_capacitaciones SET estado = true, borrador = false, fecha_activacion = CURRENT_TIMESTAMP
           WHERE id_capacitacion = $1 AND id_empresa = $2`,
          [id_capacitacion, id_empresa]
        );
  
        await registrarBitacora(id_admin, id_empresa, "ACTIVAR_PRE_CAPACITACION", `Se activó plantilla ID ${id_capacitacion}`);
        return res.status(200).json({ message: "Plantilla activada correctamente." });
      }
  
      // Si es desactivación
      await pool.query(
        `UPDATE pre_capacitaciones SET estado = false
         WHERE id_capacitacion = $1 AND id_empresa = $2`,
        [id_capacitacion, id_empresa]
      );
  
      await registrarBitacora(id_admin, id_empresa, "DESACTIVAR_PRE_CAPACITACION", `Se desactivó plantilla ID ${id_capacitacion}`);
      res.status(200).json({ message: "Plantilla desactivada correctamente." });
  
    } catch (error) {
      await registrarError("error", error.message, "cambiarEstadoPreCapacitacion");
      res.status(500).json({ error: "Error al cambiar el estado de la plantilla." });
    }
  };
  

module.exports = {
  crearPreCapacitacion,
  actualizarPreCapacitacion,
  obtenerPreCapacitaciones,
  activarPreCapacitacion,
  cambiarEstadoPreCapacitacion
};
