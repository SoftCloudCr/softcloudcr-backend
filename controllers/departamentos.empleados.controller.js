const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Asocia un empleado a un departamento
 */
const asociarEmpleadoADepartamento = async (req, res) => {
  const { id_usuario, id_departamento, id_empresa, id_admin } = req.body;

  if (!id_usuario || !id_departamento || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Validar que el usuario y el departamento existan
    const [usuario, departamento] = await Promise.all([
      pool.query(`SELECT * FROM usuarios WHERE id_usuario = $1 AND id_empresa = $2 AND id_rol = 2`, [id_usuario, id_empresa]),
      pool.query(`SELECT * FROM departamentos WHERE id_departamento = $1 AND id_empresa = $2 AND estado = true`, [id_departamento, id_empresa])
    ]);

    if (usuario.rowCount === 0 || departamento.rowCount === 0) {
      return res.status(404).json({ error: "Usuario o departamento no encontrado." });
    }

    // Validar si ya existe la asociación
    const existe = await pool.query(
      `SELECT * FROM usuarios_departamentos WHERE id_usuario = $1 AND id_departamento = $2`,
      [id_usuario, id_departamento]
    );

    if (existe.rowCount > 0) {
      return res.status(400).json({ error: "El empleado ya está asignado a este departamento." });
    }

    // Crear la asociación
    await pool.query(
      `INSERT INTO usuarios_departamentos (id_usuario, id_departamento, id_empresa)
       VALUES ($1, $2, $3)`,
      [id_usuario, id_departamento, id_empresa]
    );

    await registrarBitacora(id_admin, id_empresa, "ASOCIAR_USUARIO_DEPARTAMENTO", `Empleado ${id_usuario} asignado a departamento ${id_departamento}`);

    res.status(201).json({ message: "Empleado asociado correctamente al departamento." });
  } catch (error) {
    await registrarError("error", error.message, "asociarEmpleadoADepartamento");
    res.status(500).json({ error: "Error al asociar empleado al departamento." });
  }
};

/**
 * Elimina la asociación entre empleado y departamento
 */
const eliminarEmpleadoDeDepartamento = async (req, res) => {
  const { id_usuario, id_departamento, id_empresa, id_admin } = req.body;

  if (!id_usuario || !id_departamento || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    await pool.query(
      `DELETE FROM usuarios_departamentos WHERE id_usuario = $1 AND id_departamento = $2 AND id_empresa = $3`,
      [id_usuario, id_departamento, id_empresa]
    );

    await registrarBitacora(id_admin, id_empresa, "ELIMINAR_USUARIO_DEPARTAMENTO", `Empleado ${id_usuario} eliminado del departamento ${id_departamento}`);

    res.status(200).json({ message: "Asociación eliminada correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "eliminarEmpleadoDeDepartamento");
    res.status(500).json({ error: "Error al eliminar la asociación del empleado." });
  }
};

/**
 * Obtiene todos los empleados asociados a un departamento
 */
const obtenerEmpleadosPorDepartamento = async (req, res) => {
  const { id_departamento, id_empresa } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.codigo_empleado
       FROM usuarios u
       INNER JOIN usuarios_departamentos ud ON u.id_usuario = ud.id_usuario
       WHERE ud.id_departamento = $1 AND ud.id_empresa = $2 AND u.id_rol = 2`,
      [id_departamento, id_empresa]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerEmpleadosPorDepartamento");
    res.status(500).json({ error: "Error al obtener los empleados del departamento." });
  }
};


/**
 * Obtiene todos los departamentos a los que pertenece un empleado
 */
const obtenerDepartamentosPorEmpleado = async (req, res) => {
    const { id_usuario, id_empresa } = req.params;
  
    try {
      const result = await pool.query(
        `SELECT d.id_departamento, d.nombre, d.descripcion
         FROM departamentos d
         INNER JOIN usuarios_departamento ud ON d.id_departamento = ud.id_departamento
         WHERE ud.id_usuario = $1 AND ud.id_empresa = $2 AND d.estado = true`,
        [id_usuario, id_empresa]
      );
  
      res.status(200).json(result.rows);
    } catch (error) {
      await registrarError("error", error.message, "obtenerDepartamentosPorEmpleado");
      res.status(500).json({ error: "Error al obtener departamentos del empleado." });
    }
  };








module.exports = {
    asociarEmpleadoADepartamento,
    eliminarEmpleadoDeDepartamento,
    obtenerEmpleadosPorDepartamento,
    obtenerDepartamentosPorEmpleado,

};