const pool = require("../models/db");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Registra un intento de cuestionario de un empleado
 */
const registrarIntento = async (req, res) => {
    const { id_asignacion, id_empresa, id_usuario, respuestas } = req.body;
  
    if (!id_asignacion || !id_empresa || !id_usuario || !Array.isArray(respuestas)) {
      return res.status(400).json({ error: "Faltan campos obligatorios o respuestas inválidas." });
    }
  
    const client = await pool.connect();
  
    try {
      await client.query("BEGIN");
  
      // 1. Verificar que la asignación exista y obtener el cuestionario vinculado
      const asignacion = await client.query(
        `SELECT a.id_capacitacion, a.estado, c.id_cuestionario_usuario, ca.nota_minima
         FROM usuarios_capacitaciones a
         INNER JOIN capacitaciones_activas ca ON ca.id_capacitacion = a.id_capacitacion
         INNER JOIN cuestionarios_usuarios c ON c.id_capacitacion = a.id_capacitacion
         WHERE a.id_asignacion = $1 AND a.id_empresa = $2 AND a.id_usuario = $3`,
        [id_asignacion, id_empresa, id_usuario]
      );
  
      if (asignacion.rowCount === 0) {
        await registrarError("warning", "Intento inválido: asignación no encontrada", "registrarIntentoCuestionario");
        return res.status(404).json({ error: "Asignación no encontrada." });
      }
  
      const {
        id_capacitacion,
        id_cuestionario_usuario: idCuestionarioUsuario,
        nota_minima
      } = asignacion.rows[0];
  
      // 2. Verificar intentos anteriores
      const intentosPrevios = await client.query(
        `SELECT COUNT(*) FROM intentos_cuestionario
         WHERE id_asignacion = $1 AND id_empresa = $2`,
        [id_asignacion, id_empresa]
      );
  
      const cuestionarioInfo = await client.query(
        `SELECT intentos_permitidos FROM cuestionarios_usuarios
         WHERE id_cuestionario_usuario = $1 AND id_empresa = $2`,
        [idCuestionarioUsuario, id_empresa]
      );
  
      const intentosPermitidos = cuestionarioInfo.rows[0]?.intentos_permitidos ?? 1;
      const intentosHechos = parseInt(intentosPrevios.rows[0].count);
  
      if (intentosHechos >= intentosPermitidos) {
        return res.status(400).json({ error: "Ya alcanzaste el límite de intentos permitidos." });
      }
  
      // 3. Calcular nota
      const preguntas = await client.query(
        `SELECT p.id_pregunta_usuario, p.tipo
         FROM preguntas_usuarios p
         WHERE p.id_cuestionario_usuario = $1 AND p.id_empresa = $2 AND p.estado = true`,
        [idCuestionarioUsuario, id_empresa]
      );
  
      let nota = 0;
      let total = preguntas.rowCount;
      
      for (const pregunta of preguntas.rows) {
        // Buscar respuesta enviada por el usuario para esta pregunta
        const respuestaUsuario = respuestas.find(
          r => parseInt(r.id_pregunta) === pregunta.id_pregunta_usuario
        );
      
        if (!respuestaUsuario) continue; // si no hay respuesta, saltar
      
        const opcionesCorrectas = await client.query(
          `SELECT id_opcion_usuario FROM opciones_usuarios
           WHERE id_pregunta_usuario = $1 AND id_empresa = $2 AND es_correcta = true AND estado = true`,
          [pregunta.id_pregunta_usuario, id_empresa]
        );
      
        const correctas = opcionesCorrectas.rows.map(o => o.id_opcion_usuario);
        const valorPregunta = 100 / total;
      
        // Log temporal para verificar
        /*
        console.log({
          idPregunta: pregunta.id_pregunta_usuario,
          tipo: pregunta.tipo,
          correctas,
          usuario: respuestaUsuario.respuestas
        });
        */
      
        if (pregunta.tipo === "unica") {
          if (
            correctas.length === 1 &&
            respuestaUsuario.respuestas.length === 1 &&
            correctas.includes(respuestaUsuario.respuestas[0])
          ) {
            nota += valorPregunta;
          }
        } else {
          const aciertos = respuestaUsuario.respuestas.filter(r => correctas.includes(r));
          const puntosPorOpcion = valorPregunta / correctas.length;
          nota += puntosPorOpcion * aciertos.length;
        }
      }
  
      nota = Math.round(nota * 100) / 100; // redondear a dos decimales
      const aprobado = nota >= nota_minima;
  
      // 4. Registrar intento
      const duracion = null; // en segundos, puedes calcularlo si lo pasás desde el frontend
      const userAgent = req.headers['user-agent'] || 'Desconocido';
  
      const intento = await client.query(
        `INSERT INTO intentos_cuestionario (
          id_asignacion, id_empresa, id_cuestionario_usuario, fecha_intento,
          respuestas, nota, aprobado, duracion_segundos, user_agent
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, $8)
         RETURNING id_intento`,
        [
          id_asignacion,
          id_empresa,
          idCuestionarioUsuario,
          JSON.stringify(respuestas),
          nota,
          aprobado,
          duracion,
          userAgent
        ]
      );
      const id_intento = intento.rows[0].id_intento;
          // 5. Actualizar resultado si es mejor

        const resultadoPrevio = await client.query(
            `SELECT nota FROM resultados_cuestionario
            WHERE id_usuario_capacitacion = $1 AND id_empresa = $2`,
            [id_asignacion, id_empresa]
        );
        
        if (resultadoPrevio.rowCount === 0 || nota > resultadoPrevio.rows[0].nota) {
            await client.query(
            `INSERT INTO resultados_cuestionario (
                id_usuario_capacitacion, id_intento, id_empresa,
                nota, aprobado, fecha_registro
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (id_usuario_capacitacion)
            DO UPDATE SET
                nota = EXCLUDED.nota,
                aprobado = EXCLUDED.aprobado,
                id_intento = EXCLUDED.id_intento,
                fecha_registro = EXCLUDED.fecha_registro`,
            [id_asignacion, id_intento, id_empresa, nota, aprobado]
            );
        }
  
  
      // 6. Registrar en gamificación (solo base)
      await client.query(
        `INSERT INTO gamificacion (id_empresa, id_usuario, id_asignacion, id_cuestionario_usuario, puntos_obtenidos, evento, fecha_obtencion)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [id_empresa, id_usuario, id_asignacion, id_asignacion, Math.round(nota), "INTENTO_REALIZADO"]
      );
  
      await client.query("COMMIT");
  
      res.status(201).json({
        message: "Intento registrado correctamente.",
        nota,
        aprobado
      });
  
    } catch (error) {
      await client.query("ROLLBACK");
      await registrarError("error", error.message, "registrarIntentoCuestionario");
      res.status(500).json({ error: "Error al registrar el intento." });
    } finally {
      client.release();
    }
  };
  
// TODO: Registrar interacción en historial_interacciones_capacitacion si el estado cambia manualmente


module.exports = {
  registrarIntento,
};
