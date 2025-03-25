const pool = require("../models/db");

/**
 * Registra un evento en la bitácora de acciones
 * @param {Number} id_usuario - Usuario que ejecuta la acción
 * @param {Number} id_empresa - Empresa a la que pertenece
 * @param {String} accion - Tipo de acción (ej. 'ACTUALIZAR_EMPLEADO')
 * @param {String} detalle - Descripción de lo que se hizo
 */
const registrarBitacora = async (id_usuario, id_empresa, accion, detalle) => {
  try {
    await pool.query(
      `INSERT INTO bitacora (id_usuario, id_empresa, accion, detalle)
       VALUES ($1, $2, $3, $4)`,
      [id_usuario, id_empresa, accion, detalle]
    );
  } catch (error) {
    console.error("Error al registrar en bitácora:", error.message);
  }
};

/**
 * Registra un error interno en la tabla de log_errores
 * @param {String} nivel - 'info' | 'warning' | 'error'
 * @param {String} mensaje - Descripción del error
 * @param {String} funcion - Nombre de la función donde ocurrió
 */
const registrarError = async (nivel, mensaje, funcion) => {
  try {
    await pool.query(
      `INSERT INTO log_errores (nivel, mensaje, funcion)
       VALUES ($1, $2, $3)`,
      [nivel, mensaje, funcion]
    );
  } catch (error) {
    console.error("Error al registrar en log_errores:", error.message);
  }
};

module.exports = {
  registrarBitacora,
  registrarError,
};
