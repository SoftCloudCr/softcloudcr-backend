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
      `INSERT INTO cuestionarios_catalogo (id_empresa, nombre, descripcion, intentos_permitidos, fecha_creacion, borrador)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, true)
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
       SET nombre = $1, descripcion = $2, intentos_permitidos = $3, borrador = true
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
  

  /**
 * Publica un cuestionario (borrador → activo), validando su estructura
 */
const publicarCuestionario = async (req, res) => {
  const { id_cuestionario } = req.params;
  const { id_empresa, id_admin } = req.body;

  if (!id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  try {
    // Obtener cuestionario
    const cuestionario = await pool.query(
      `SELECT * FROM cuestionarios_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true`,
      [id_cuestionario, id_empresa]
    );

    if (cuestionario.rowCount === 0) {
      return res.status(404).json({ error: "Cuestionario no encontrado." });
    }

    const cuestionarioData = cuestionario.rows[0];

    // Si ya está publicado, no hacer nada
    if (!cuestionarioData.borrador) {
      return res.status(400).json({ error: "El cuestionario ya está publicado." });
    }

    // Obtener preguntas activas
    const preguntas = await pool.query(
      `SELECT * FROM preguntas_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true`,
      [id_cuestionario, id_empresa]
    );

    if (preguntas.rowCount === 0) {
      return res.status(400).json({ error: "El cuestionario no tiene preguntas activas." });
    }

    for (const pregunta of preguntas.rows) {
      const opciones = await pool.query(
        `SELECT * FROM opciones_catalogo
         WHERE id_pregunta = $1 AND id_empresa = $2 AND estado = true`,
        [pregunta.id_pregunta, id_empresa]
      );

      const opcionesValidas = opciones.rows;
      const correctas = opcionesValidas.filter(o => o.es_correcta === true);

      if (correctas.length === 0) {
        return res.status(400).json({
          error: `La pregunta "${pregunta.texto}" no tiene ninguna opción correcta.`
        });
      }

      if (pregunta.tipo === "unica" && correctas.length > 1) {
        return res.status(400).json({
          error: `La pregunta "${pregunta.texto}" es de tipo única, pero tiene múltiples opciones correctas.`
        });
      }
    }

    // Si pasa todas las validaciones, activar el cuestionario
    await pool.query(
      `UPDATE cuestionarios_catalogo
       SET borrador = false
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [id_cuestionario, id_empresa]
    );

    const accion = "PUBLICAR_CUESTIONARIO";
    const detalle = `Se publicó el cuestionario '${cuestionarioData.nombre}' (ID ${id_cuestionario})`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: "Cuestionario publicado correctamente." });
  } catch (error) {
    await registrarError("error", error.message, "publicarCuestionario");
    res.status(500).json({ error: "Error al publicar el cuestionario." });
  }
};


/**
 * Verifica la integridad del cuestionario antes de publicar
 */
const verificarCuestionario = async (req, res) => {
  const { id_cuestionario } = req.params;
  const { id_empresa } = req.query;

  if (!id_empresa) {
    return res.status(400).json({ error: "Falta el id_empresa." });
  }

  try {
    const cuestionario = await pool.query(
      `SELECT * FROM cuestionarios_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2`,
      [id_cuestionario, id_empresa]
    );

    if (cuestionario.rowCount === 0) {
      return res.status(404).json({ error: "Cuestionario no encontrado." });
    }

    const estado_actual = cuestionario.rows[0].borrador ? "borrador" : "publicado";

    const preguntas = await pool.query(
      `SELECT * FROM preguntas_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true`,
      [id_cuestionario, id_empresa]
    );

    const total_preguntas = preguntas.rowCount;
    let preguntas_sin_opciones = [];
    let preguntas_sin_respuesta_correcta = [];
    let preguntas_con_multiples_correctas_unica = [];
    let preguntas_validas = 0;

    for (const pregunta of preguntas.rows) {
      const opciones = await pool.query(
        `SELECT * FROM opciones_catalogo
         WHERE id_pregunta = $1 AND id_empresa = $2 AND estado = true`,
        [pregunta.id_pregunta, id_empresa]
      );

      const lista = opciones.rows;
      const correctas = lista.filter(o => o.es_correcta === true);

      if (lista.length === 0) {
        preguntas_sin_opciones.push({
          id: pregunta.id_pregunta,
          texto: pregunta.texto
        });
        continue;
      }

      if (correctas.length === 0) {
        preguntas_sin_respuesta_correcta.push({
          id: pregunta.id_pregunta,
          texto: pregunta.texto
        });
        continue;
      }

      if (pregunta.tipo === "unica" && correctas.length > 1) {
        preguntas_con_multiples_correctas_unica.push({
          id: pregunta.id_pregunta,
          texto: pregunta.texto
        });
        continue;
      }

      preguntas_validas++;
    }

    const valido_para_publicar =
      preguntas_validas > 0 &&
      preguntas_sin_opciones.length === 0 &&
      preguntas_sin_respuesta_correcta.length === 0 &&
      preguntas_con_multiples_correctas_unica.length === 0;

    res.status(200).json({
      estado_actual,
      total_preguntas,
      preguntas_sin_opciones,
      preguntas_sin_respuesta_correcta,
      preguntas_con_multiples_correctas_unica,
      preguntas_validas,
      valido_para_publicar
    });
  } catch (error) {
    await registrarError("error", error.message, "verificarCuestionario");
    res.status(500).json({ error: "Error al verificar el cuestionario." });
  }
};

/**
 * Genera la vista previa del cuestionario (como lo vería el empleado)
 */
const vistaPreviaCuestionario = async (req, res) => {
  const { id_cuestionario } = req.params;
  const { id_empresa } = req.query;

  if (!id_empresa) {
    return res.status(400).json({ error: "Falta el id_empresa." });
  }

  try {
    const cuestionario = await pool.query(
      `SELECT nombre, descripcion, intentos_permitidos, borrador
       FROM cuestionarios_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true`,
      [id_cuestionario, id_empresa]
    );

    if (cuestionario.rowCount === 0) {
      return res.status(404).json({ error: "Cuestionario no encontrado." });
    }

    const infoCuestionario = cuestionario.rows[0];

    // Obtener preguntas activas
    const preguntas = await pool.query(
      `SELECT id_pregunta, texto, tipo
       FROM preguntas_catalogo
       WHERE id_cuestionario = $1 AND id_empresa = $2 AND estado = true
       ORDER BY id_pregunta ASC`,
      [id_cuestionario, id_empresa]
    );

    const preguntasConOpciones = [];

    for (const pregunta of preguntas.rows) {
      const opciones = await pool.query(
        `SELECT id_opcion, texto
         FROM opciones_catalogo
         WHERE id_pregunta = $1 AND id_empresa = $2 AND estado = true
         ORDER BY id_opcion ASC`,
        [pregunta.id_pregunta, id_empresa]
      );

      preguntasConOpciones.push({
        id_pregunta: pregunta.id_pregunta,
        texto: pregunta.texto,
        tipo: pregunta.tipo,
        opciones: opciones.rows
      });
    }

    res.status(200).json({
      titulo: infoCuestionario.nombre,
      descripcion: infoCuestionario.descripcion,
      intentos_permitidos: infoCuestionario.intentos_permitidos,
      borrador: infoCuestionario.borrador,
      preguntas: preguntasConOpciones
    });
  } catch (error) {
    await registrarError("error", error.message, "vistaPreviaCuestionario");
    res.status(500).json({ error: "Error al generar la vista previa del cuestionario." });
  }
};



module.exports = {
  obtenerCuestionarios,
  crearCuestionario,
  actualizarCuestionario,
  cambiarEstadoCuestionario,
  eliminarCuestionario,
  publicarCuestionario,
  verificarCuestionario,
  vistaPreviaCuestionario
};
