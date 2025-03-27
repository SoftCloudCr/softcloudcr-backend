const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Crea un nuevo departamento
 */
const crearDepartamento = async (req, res) => {
  const { id_empresa, nombre, descripcion, id_admin } = req.body;

  if (!id_empresa || !nombre || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO departamentos (id_empresa, nombre, descripcion)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_empresa, nombre, descripcion || null]
    );

    const nuevo = result.rows[0];

    await registrarBitacora(
      id_admin,
      id_empresa,
      "CREAR_DEPARTAMENTO",
      `Se creó el departamento '${nombre}' (ID: ${nuevo.id_departamento})`
    );

    res.status(201).json(nuevo);
  } catch (error) {
    await registrarError("error", error.message, "crearDepartamento");
    res.status(500).json({ error: "Error al crear el departamento." });
  }
};

/**
 * Obtiene todos los departamentos activos de una empresa
 */
const obtenerDepartamentos = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM departamentos
       WHERE id_empresa = $1 AND estado = true
       ORDER BY nombre ASC`,
      [id_empresa]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerDepartamentos");
    res.status(500).json({ error: "Error al obtener los departamentos." });
  }
};

/**
 * Actualiza un departamento
 */
const actualizarDepartamento = async (req, res) => {
  const { id_departamento } = req.params;
  const { nombre, descripcion, id_empresa, id_admin } = req.body;

  if (!nombre || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const anterior = await pool.query(
      `SELECT * FROM departamentos WHERE id_departamento = $1 AND id_empresa = $2`,
      [id_departamento, id_empresa]
    );

    if (anterior.rowCount === 0) {
      return res.status(404).json({ error: "Departamento no encontrado." });
    }

    const depAnterior = anterior.rows[0];

    await pool.query(
      `UPDATE departamentos
       SET nombre = $1, descripcion = $2
       WHERE id_departamento = $3 AND id_empresa = $4`,
      [nombre, descripcion || null, id_departamento, id_empresa]
    );

    await registrarBitacora(
      id_admin,
      id_empresa,
      "ACTUALIZAR_DEPARTAMENTO",
      `Se actualizó el departamento ID ${id_departamento}:
       Nombre: ${depAnterior.nombre} → ${nombre}
       Descripción: ${depAnterior.descripcion} → ${descripcion}`
    );

    res.status(200).json({ message: "Departamento actualizado correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "actualizarDepartamento");
    res.status(500).json({ error: "Error al actualizar el departamento." });
  }
};

/**
 * Activa o desactiva un departamento (eliminación lógica)
 */
const eliminarDepartamento = async (req, res) => {
    const { id_departamento } = req.params;
    const { id_empresa, id_admin, estado } = req.body; // estado esperado: true (activar) o false (desactivar)
  
    if (!id_empresa || !id_admin || typeof estado !== "boolean") {
      return res.status(400).json({ error: "Faltan datos o estado inválido." });
    }
  
    try {
      // Verifica que el departamento exista
      const result = await pool.query(
        `SELECT * FROM departamentos
         WHERE id_departamento = $1 AND id_empresa = $2`,
        [id_departamento, id_empresa]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Departamento no encontrado." });
      }
  
      const departamento = result.rows[0];
  
      if (!estado) {
        // Si se intenta desactivar, validar que no tenga empleados asociados
        const asociados = await pool.query(
          `SELECT * FROM usuarios_departamentos
           WHERE id_departamento = $1 AND id_empresa = $2`,
          [id_departamento, id_empresa]
        );
  
        if (asociados.rowCount > 0) {
          await registrarError("warning", "Intento de desactivar departamento con usuarios asociados", "eliminarDepartamento");
  
          return res.status(400).json({
            error: "No se puede desactivar el departamento porque tiene empleados asignados."
          });
        }
      }
  
      // Cambio de estado (activar o desactivar)
      await pool.query(
        `UPDATE departamentos SET estado = $1
         WHERE id_departamento = $2 AND id_empresa = $3`,
        [estado, id_departamento, id_empresa]
      );
  
      const accion = estado ? "REACTIVAR_DEPARTAMENTO" : "DESACTIVAR_DEPARTAMENTO";
      const detalle = `${estado ? "Se reactivó" : "Se desactivó"} el departamento '${departamento.nombre}' (ID: ${id_departamento})`;
  
      await registrarBitacora(id_admin, id_empresa, accion, detalle);
  
      res.status(200).json({ message: `Departamento ${estado ? "activado" : "desactivado"} correctamente.` });
    } catch (error) {
      console.error("Error al cambiar estado del departamento:", error);
      await registrarError("error", error.message, "eliminarDepartamento");
      res.status(500).json({ error: "Error al cambiar el estado del departamento." });
    }
  };
  
/**
 * Obtiene la cantidad de empleados por departamento (para dashboard)
 */
const obtenerResumenDepartamentos = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.id_departamento, d.nombre, COUNT(ud.id_usuario) AS cantidad_empleados
       FROM departamentos d
       LEFT JOIN usuarios_departamento ud ON d.id_departamento = ud.id_departamento AND ud.id_empresa = $1
       WHERE d.id_empresa = $1 AND d.estado = true
       GROUP BY d.id_departamento
       ORDER BY d.nombre`,
      [id_empresa]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerResumenDepartamentos");
    res.status(500).json({ error: "Error al obtener resumen de departamentos." });
  }
};

/**
 * Obtiene los departamentos inactivos de una empresa
 */
const obtenerDepartamentosInactivos = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM departamentos
       WHERE id_empresa = $1 AND estado = false
       ORDER BY nombre ASC`,
      [id_empresa]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    await registrarError("error", error.message, "obtenerDepartamentosInactivos");
    res.status(500).json({ error: "Error al obtener departamentos inactivos." });
  }
};



module.exports = {
  crearDepartamento,
  obtenerDepartamentos,
  actualizarDepartamento,
  eliminarDepartamento,
  obtenerResumenDepartamentos,
  obtenerDepartamentosInactivos,
};
