const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

const obtenerCapacitacionesAsignadas = async (req, res) => {
    const { id_usuario, id_empresa } = req.params;
  
    if (!id_usuario || !id_empresa) {
      return res.status(400).json({ error: "Faltan parámetros obligatorios." });
    }
  
    try {
      const result = await pool.query(`
        SELECT 
          uc.id_asignacion,
          ca.nombre AS nombre_capacitacion,
          ca.estado,
          ca.fecha_inicio,
          ca.fecha_limite,
          cu.intentos_permitidos,
          (
            SELECT COUNT(*) 
            FROM intentos_cuestionario ic 
            WHERE ic.id_asignacion = uc.id_asignacion AND ic.id_empresa = $2
          ) AS intentos_hechos
        FROM usuarios_capacitaciones uc
        INNER JOIN capacitaciones_activas ca ON ca.id_capacitacion = uc.id_capacitacion
        INNER JOIN cuestionarios_usuarios cu ON cu.id_capacitacion = ca.id_capacitacion
        WHERE uc.id_usuario = $1 AND uc.id_empresa = $2
        ORDER BY ca.fecha_inicio DESC
      `, [id_usuario, id_empresa]);
  
      res.status(200).json(result.rows);
    } catch (error) {
      await registrarError("error", error.message, "obtenerCapacitacionesAsignadas");
      res.status(500).json({ error: "Error al obtener las capacitaciones asignadas." });
    }
  };



/**
 * Lista solo las capacitaciones activas pendientes de un empleado
 */
const listarCapacitacionesPendientes = async (req, res) => {
    const { id_usuario, id_empresa } = req.params;
  
    try {
      const resultado = await pool.query(
        `SELECT 
           uc.id_asignacion,
           ca.nombre AS nombre_capacitacion,
           uc.estado,
           ca.fecha_inicio,
           ca.fecha_limite,
           cu.intentos_permitidos,
           (
             SELECT COUNT(*) 
             FROM intentos_cuestionario ic 
             WHERE ic.id_asignacion = uc.id_asignacion AND ic.id_empresa = $2
           ) AS intentos_hechos
         FROM usuarios_capacitaciones uc
         INNER JOIN capacitaciones_activas ca ON ca.id_capacitacion = uc.id_capacitacion
         INNER JOIN cuestionarios_usuarios cu ON cu.id_capacitacion = ca.id_capacitacion
         WHERE uc.id_usuario = $1 AND uc.id_empresa = $2 AND uc.estado = 'pendiente' or uc.estado = 'reprobado'
         ORDER BY ca.fecha_inicio DESC`,
        [id_usuario, id_empresa]
      );
  
      res.status(200).json(resultado.rows);
    } catch (error) {
      await registrarError("error", error.message, "listarCapacitacionesPendientes");
      res.status(500).json({ error: "Error al obtener capacitaciones pendientes." });
    }
  };


  
  module.exports ={
    obtenerCapacitacionesAsignadas,
    listarCapacitacionesPendientes,
  };