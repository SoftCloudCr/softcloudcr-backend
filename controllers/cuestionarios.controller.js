const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Obtiene todos los cuestionarios de una empresa
 */
const obtenerCuestionarios = async (req, res) => {
    const { id_empresa } = req.params;
  
    try {
      const result = await pool.query(
        `SELECT * FROM cuestionarios_catalogo 
         WHERE id_empresa = $1 AND estado = true`,
        [id_empresa]
      );
  
      res.status(200).json(result.rows);
    } catch (error) {
      await registrarError("error", error.message, "obtenerCuestionarios");
      res.status(500).json({ error: "Error al obtener los cuestionarios." });
    }
  };
  

/**
 * Crea un nuevo cuestionario
 */
const crearCuestionario = async (req, res) => {
  const { id_empresa, nombre, descripcion, intentos_permitidos, id_admin } = req.body;

  if (!id_empresa || !nombre || !descripcion || !intentos_permitidos || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cuestionarios_catalogo (id_empresa, nombre, descripcion, intentos_permitidos, fecha_creacion)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id_empresa, nombre, descripcion, intentos_permitidos]
    );

    const nuevo = result.rows[0];
    const accion = "CREAR_CUESTIONARIO";
    const detalle = `Se creó el cuestionario '${nombre}' con ID ${nuevo.id_cuestionario}`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(201).json(nuevo);
  } catch (error) {
    await registrarError("error", error.message, "crearCuestionario");
    res.status(500).json({ error: "Error al crear el cuestionario." });
  }
};

/**
 * Actualiza un cuestionario existente
 */
const actualizarCuestionario = async (req, res) => {
  const { id_cuestionario } = req.params;
  const { nombre, descripcion, intentos_permitidos, id_empresa, id_admin } = req.body;

  if (!nombre || !descripcion || !intentos_permitidos || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Obtener valores anteriores para bitácora
    const previo = await pool.query(
      `SELECT * FROM cuestionarios_catalogo WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [id_cuestionario, id_empresa]
    );

    if (previo.rowCount === 0) {
      return res.status(404).json({ error: "Cuestionario no encontrado." });
    }

    const cuestionarioAnterior = previo.rows[0];

    await pool.query(
      `UPDATE cuestionarios_catalogo
       SET nombre = $1, descripcion = $2, intentos_permitidos = $3
       WHERE id_cuestionario = $4 AND id_empresa = $5`,
      [nombre, descripcion, intentos_permitidos, id_cuestionario, id_empresa]
    );

    const accion = "ACTUALIZAR_CUESTIONARIO";
    const detalle = `Se actualizó el cuestionario ID ${id_cuestionario}:
                     Nombre: ${cuestionarioAnterior.nombre} → ${nombre}
                     Descripción: ${cuestionarioAnterior.descripcion} → ${descripcion}
                     Intentos permitidos: ${cuestionarioAnterior.intentos_permitidos} → ${intentos_permitidos}`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: "Cuestionario actualizado correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "actualizarCuestionario");
    res.status(500).json({ error: "Error al actualizar el cuestionario." });
  }
};

/**
 * Elimina un cuestionario / Cambia el estado a FALSE
 */
const cambiarEstadoCuestionario = async (req, res) => {
    const { id_cuestionario } = req.params;
    const { id_empresa, id_admin, estado } = req.body; // estado esperado: true o false
  
    if (!id_empresa || !id_admin || typeof estado !== "boolean") {
      return res.status(400).json({ error: "Faltan datos o estado inválido." });
    }
  
    try {
      const cuestionario = await pool.query(
        `SELECT * FROM cuestionarios_catalogo WHERE id_cuestionario = $1 AND id_empresa = $2`,
        [id_cuestionario, id_empresa]
      );
  
      if (cuestionario.rowCount === 0) {
        return res.status(404).json({ error: "Cuestionario no encontrado." });
      }
  
      const cuestionarioData = cuestionario.rows[0];
  
      if (!estado) {
        // Si se va a desactivar, validar que no esté ligado a pre_capacitaciones
        const dependencia = await pool.query(
          `SELECT * FROM pre_capacitaciones WHERE id_cuestionario = $1 AND id_empresa = $2`,
          [id_cuestionario, id_empresa]
        );
  
        if (dependencia.rowCount > 0) {
          await registrarError("warning", `Intento de ocultar cuestionario en uso`, "cambiarEstadoCuestionario");
          return res.status(400).json({
            error: "No se puede ocultar el cuestionario porque ya está ligado a una capacitación."
          });
        }
      }
  
      await pool.query(
        `UPDATE cuestionarios_catalogo SET estado = $1 WHERE id_cuestionario = $2 AND id_empresa = $3`,
        [estado, id_cuestionario, id_empresa]
      );
  
      const accion = estado ? "ACTIVAR_CUESTIONARIO" : "OCULTAR_CUESTIONARIO";
      const detalle = `${estado ? "Se reactivó" : "Se ocultó"} el cuestionario '${cuestionarioData.nombre}' (ID ${id_cuestionario})`;
  
      await registrarBitacora(id_admin, id_empresa, accion, detalle);
  
      res.status(200).json({ message: `Cuestionario ${estado ? "activado" : "ocultado"} correctamente.` });
    } catch (error) {
      console.error("Error al cambiar estado de cuestionario:", error);
      await registrarError("error", error.message, "cambiarEstadoCuestionario");
      res.status(500).json({ error: "Error al cambiar el estado del cuestionario." });
    }
  };
  

/**
 * Elimina un cuestionario / Cambia el estado a FALSE
 */

const eliminarCuestionario = async (req, res) => {
    const { id_cuestionario } = req.params;
    const { id_empresa, id_admin } = req.body;
  
    if (!id_empresa || !id_admin) {
      return res.status(400).json({ error: "Faltan datos necesarios." });
    }
  
    try {
      // Verifica que el cuestionario exista
      const cuestionario = await pool.query(
        `SELECT * FROM cuestionarios_catalogo WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true`,
        [id_cuestionario, id_empresa]
      );
  
      if (cuestionario.rowCount === 0) {
        return res.status(404).json({ error: "Cuestionario no encontrado o ya fue eliminado." });
      }
  
      const cuestionarioData = cuestionario.rows[0];
  
      // Validar si está ligado a alguna pre_capacitación
      const dependencia = await pool.query(
        `SELECT * FROM pre_capacitaciones WHERE id_cuestionario = $1 AND id_empresa = $2`,
        [id_cuestionario, id_empresa]
      );
  
      if (dependencia.rowCount > 0) {
        await registrarError("warning", `Intento de eliminar cuestionario ligado a pre_capacitación`, "eliminarCuestionario");
        return res.status(400).json({
          error: "No se puede ocultar el cuestionario porque ya está ligado a una capacitación."
        });
      }
  
      // Eliminación lógica
      await pool.query(
        `UPDATE cuestionarios_catalogo SET estado = false WHERE id_cuestionario = $1 AND id_empresa = $2`,
        [id_cuestionario, id_empresa]
      );
  
      const accion = "OCULTAR_CUESTIONARIO";
      const detalle = `Se ocultó el cuestionario '${cuestionarioData.nombre}' (ID ${id_cuestionario})`;
  
      await registrarBitacora(id_admin, id_empresa, accion, detalle);
  
      res.status(200).json({ message: "Cuestionario ocultado correctamente." });
    } catch (error) {
      console.error("Error al ocultar cuestionario:", error);
      await registrarError("error", error.message, "eliminarCuestionario");
      res.status(500).json({ error: "Error al ocultar el cuestionario." });
    }
  };
  


module.exports = {
  obtenerCuestionarios,
  crearCuestionario,
  actualizarCuestionario,
  cambiarEstadoCuestionario,
  eliminarCuestionario,
};
