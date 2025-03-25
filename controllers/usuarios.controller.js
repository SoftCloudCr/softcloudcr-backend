const pool = require("../models/db");
const bcrypt = require("bcrypt");
const { registrarBitacora, registrarError } = require("../utils/logger");





/**
 * Cambiar la contraseña de un usuario
 */
const cambiarClave = async (req, res) => {
    const { id } = req.params;
    const { nueva_clave } = req.body;
  
    if (!nueva_clave) {
      return res.status(400).json({ error: "La nueva clave es obligatoria" });
    }
  
    try {
      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(nueva_clave, 10);
  
      await pool.query(
        "UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2",
        [hashedPassword, id]
      );
  
      res.json({ message: "Contraseña actualizada con éxito" });
    } catch (err) {
      console.error("Error al cambiar clave:", err);
      res.status(500).json({ error: "Error interno al actualizar la clave" });
    }
  };
  
/**
 * Importación de empleados desde JSON (simula CSV)
 */
const importarEmpleados = async (req, res) => {
  const empleados = req.body.empleados;
  const id_admin = req.body.id_admin; // Admin que ejecuta
  const id_empresa = req.body.id_empresa;

  if (!Array.isArray(empleados) || empleados.length === 0 || !id_admin || !id_empresa) {
    return res.status(400).json({ error: "Datos inválidos o incompletos para importar." });
  }

  let importados = 0;

  try {
    for (const emp of empleados) {
      const {
        codigo_empleado,
        nombre,
        apellido,
        correo
      } = emp;

      // Validación
      if (!codigo_empleado || !nombre || !apellido || !correo) {
        console.log("Empleado inválido:", emp);
        continue;
      }

      // Generar clave automática
      const primeraLetra = nombre.trim().charAt(0).toLowerCase();
      const apellidoLimpio = apellido.trim().toLowerCase();
      const codigoRecortado = codigo_empleado.trim().slice(0, 4);
      const claveGenerada = `${primeraLetra}${apellidoLimpio}${codigoRecortado}`;

      const passwordHash = await bcrypt.hash(claveGenerada, 10);

      await pool.query(
        `INSERT INTO usuarios (id_empresa, codigo_empleado, nombre, apellido, correo, password_hash, id_rol, estado, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, $6, 2, true, NOW())`,
        [id_empresa, codigo_empleado, nombre, apellido, correo, passwordHash]
      );

      importados++;
    }

    // Bitácora
    const accion = "IMPORTAR_EMPLEADOS";
    const detalle = `Se importaron ${importados} empleados correctamente desde CSV simulado`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: `${importados} empleados importados correctamente.` });

  } catch (err) {
    console.error("Error al importar empleados:", err.message);
    await registrarError("error", err.message, "importarEmpleados");
    res.status(500).json({ error: "Error al importar empleados." });
  }
};

/**
 * Obtener lista de empleados con filtros opcionales
 */
const obtenerEmpleadosConFiltros = async (req, res) => {
  try {
    const { empresa, estado, nombre } = req.query;

    // Validación estricta del ID de empresa
    if (!empresa || isNaN(parseInt(empresa))) {
      return res.status(400).json({ error: "id_empresa inválido o ausente." });
    }

    let query = `
      SELECT id_usuario, codigo_empleado, nombre, apellido, correo, estado
      FROM usuarios
      WHERE id_empresa = $1 AND id_rol = 2
    `;
    let params = [empresa];
    let index = 2;

    if (estado === "true" || estado === "false") {
      query += ` AND estado = $${index}`;
      params.push(estado === "true");
      index++;
    }

    if (nombre && nombre.trim() !== "") {
      query += ` AND (LOWER(nombre) LIKE $${index} OR LOWER(apellido) LIKE $${index})`;
      params.push(`%${nombre.toLowerCase()}%`);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener empleados:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Actualiza los datos de un empleado asegurando que sea de la misma empresa
 */
const actualizarEmpleado = async (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, correo, codigo_empleado, id_empresa,id_admin  } = req.body;
  let nombre_anterior,apellido_anterior,correo_anterior,codigo_empleado_anterior;

  // Validación básica
  if (!nombre || !apellido || !correo || !codigo_empleado || !id_empresa || !id_admin) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Consulta los datos anteriores
    const result_anterior = await pool.query(
      `SELECT * FROM usuarios
       WHERE id_usuario = $1 AND id_empresa = $2 AND id_rol = 2`,
      [ id, id_empresa]
    );
    if (result_anterior.rowCount > 0) {
      const usuarioAnterior = result_anterior.rows[0];
      nombre_anterior = usuarioAnterior.nombre;
      apellido_anterior = usuarioAnterior.apellido;
      correo_anterior = usuarioAnterior.correo;
      codigo_empleado_anterior = usuarioAnterior.codigo_empleado;
    } else {
      // Si no encontró al empleado antes, tiramos error antes de actualizar
      return res.status(404).json({ error: "Empleado no encontrado." });
    }
    // Actualiza los datos
    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, apellido = $2, correo = $3, codigo_empleado = $4
       WHERE id_usuario = $5 AND id_empresa = $6 AND id_rol = 2`,
      [nombre, apellido, correo, codigo_empleado, id, id_empresa]
    );

    if (result.rowCount === 0) {
      await registrarError("warning", `Empleado ${id} no encontrado o no pertenece a empresa ${id_empresa}`, "actualizarEmpleado");
      return res.status(404).json({ error: "Empleado no encontrado o no pertenece a la empresa." });
    }

    const accion = "ACTUALIZAR_EMPLEADO";
    const detalle = `Se actualiza el empleado:  Nombre Anterior:  ${nombre_anterior} / Nombre nuevo: ${nombre} 
                    Apellido Anterior:  ${apellido_anterior} / Apellido Nuevo: ${apellido}
                    Correo Anterior: ${correo_anterior} / Correo Nuevo : ${correo}
                    Codigo Anterior: ${codigo_empleado_anterior} / Codigo Nuevo: ${codigo_empleado}`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: "Empleado actualizado correctamente." });

  } catch (err) {
    console.error("Error al actualizar empleado:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};



/**
 * Activa o desactiva un empleado de forma lógica
 */
const cambiarEstadoEmpleado = async (req, res) => {
  const id = req.params.id;
  const { id_empresa, nuevo_estado, id_admin } = req.body;

  if (!id_empresa || typeof nuevo_estado !== "boolean" || !id_admin) {
    return res.status(400).json({ error: "Faltan datos obligatorios." });
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET estado = $1
       WHERE id_usuario = $2 AND id_empresa = $3 AND id_rol = 2`,
      [nuevo_estado, id, id_empresa]
    );

    if (result.rowCount === 0) {
      await registrarError("warning", `Empleado ${id} no encontrado o no pertenece a empresa ${id_empresa}`, "cambiarEstadoEmpleado");
      return res.status(404).json({ error: "Empleado no encontrado o no pertenece a la empresa." });
    }

    const accion = nuevo_estado ? "ACTIVAR_EMPLEADO" : "DESACTIVAR_EMPLEADO";
    const detalle = `Empleado ${id} fue ${nuevo_estado ? "activado" : "desactivado"}`;

    await registrarBitacora(id_admin, id_empresa, accion, detalle);

    res.status(200).json({ message: `Empleado ${nuevo_estado ? "activado" : "desactivado"} correctamente.` });

  } catch (err) {
    console.error("Error al cambiar estado:", err.message);
    await registrarError("error", err.message, "cambiarEstadoEmpleado");
    res.status(500).json({ error: "Error interno del servidor." });
  }
};








module.exports = {
  actualizarEmpleado, 
  cambiarClave,
  importarEmpleados,
  obtenerEmpleadosConFiltros,
  cambiarEstadoEmpleado,
};
