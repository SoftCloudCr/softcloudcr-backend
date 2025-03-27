const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Asocia un departamento a una plantilla de capacitación
 */
const asociarDepartamentoACapacitacion = async (req, res) => {
  const { id_capacitacion, id_departamento, id_empresa, id_admin } = req.body;

  if (!id_capacitacion || !id_departamento || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Validar que el departamento y la capacitación existan
    const [depto, cap] = await Promise.all([
      pool.query(`SELECT * FROM departamentos WHERE id_departamento = $1 AND id_empresa = $2 AND estado = true`, [id_departamento, id_empresa]),
      pool.query(`SELECT * FROM pre_capacitaciones WHERE id_capacitacion = $1 AND id_empresa = $2`, [id_capacitacion, id_empresa])
    ]);

    if (depto.rowCount === 0 || cap.rowCount === 0) {
      return res.status(404).json({ error: "Departamento o capacitación no encontrado." });
    }

    // Validar si ya está asociado
    const existe = await pool.query(
      `SELECT * FROM pre_capacitaciones_departamentos WHERE id_capacitacion = $1 AND id_departamento = $2`,
      [id_capacitacion, id_departamento]
    );

    if (existe.rowCount > 0) {
      return res.status(400).json({ error: "El departamento ya está asignado a esta capacitación." });
    }

    // Insertar asociación
    await pool.query(
      `INSERT INTO pre_capacitaciones_departamentos (id_capacitacion, id_departamento, id_empresa)
       VALUES ($1, $2, $3)`,
      [id_capacitacion, id_departamento, id_empresa]
    );

    await registrarBitacora(id_admin, id_empresa, "ASOCIAR_DEPARTAMENTO_CAPACITACION", 
      `Departamento ${id_departamento} asignado a capacitación ${id_capacitacion}`);

    res.status(201).json({ message: "Departamento asociado correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "asociarDepartamentoACapacitacion");
    res.status(500).json({ error: "Error al asociar departamento a capacitación." });
  }
};

/**
 * Elimina la relación entre un departamento y una capacitación
 */
const eliminarDepartamentoDeCapacitacion = async (req, res) => {
  const { id_capacitacion, id_departamento, id_empresa, id_admin } = req.body;

  if (!id_capacitacion || !id_departamento || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  try {
    await pool.query(
      `DELETE FROM pre_capacitaciones_departamentos
       WHERE id_capacitacion = $1 AND id_departamento = $2 AND id_empresa = $3`,
      [id_capacitacion, id_departamento, id_empresa]
    );

    await registrarBitacora(id_admin, id_empresa, "ELIMINAR_DEPTO_CAPACITACION", 
      `Se eliminó el departamento ${id_departamento} de la capacitación ${id_capacitacion}`);

    res.status(200).json({ message: "Asociación eliminada correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "eliminarDepartamentoDeCapacitacion");
    res.status(500).json({ error: "Error al eliminar la asociación." });
  }
};

/**
 * Lista todos los departamentos asignados a una capacitación
 */
const obtenerDepartamentosPorCapacitacion = async (req, res) => {
  const { id_capacitacion, id_empresa } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.id_departamento, d.nombre
       FROM departamentos d
       INNER JOIN pre_capacitaciones_departamentos pd
       ON d.id_departamento = pd.id_departamento
       WHERE pd.id_capacitacion = $1 AND pd.id_empresa = $2 AND d.estado = true`,
      [id_capacitacion, id_empresa]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerDepartamentosPorCapacitacion");
    res.status(500).json({ error: "Error al obtener los departamentos asociados." });
  }
};


/**
 * Lista todas las capacitaciones por departamento
 */
const obtenerCapacitacionesPorDepartamento = async (req, res) => {
    const { id_departamento, id_empresa } = req.params;
  
    try {
      const result = await pool.query(
        `SELECT pc.id_capacitacion, pc.nombre, pc.descripcion, pc.estado, pc.borrador, pc.fecha_creacion
         FROM pre_capacitaciones pc
         INNER JOIN pre_capacitaciones_departamentos pd ON pc.id_capacitacion = pd.id_capacitacion
         WHERE pd.id_departamento = $1 AND pd.id_empresa = $2`,
        [id_departamento, id_empresa]
      );
  
      res.status(200).json(result.rows);
    } catch (error) {
      await registrarError("error", error.message, "obtenerCapacitacionesPorDepartamento");
      res.status(500).json({ error: "Error al obtener capacitaciones del departamento." });
    }
  };
  

module.exports = {
  asociarDepartamentoACapacitacion,
  eliminarDepartamentoDeCapacitacion,
  obtenerDepartamentosPorCapacitacion,
  obtenerCapacitacionesPorDepartamento,
};
