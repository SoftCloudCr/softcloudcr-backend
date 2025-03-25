const pool = require("../models/db");
const bcrypt = require("bcrypt");

/**
 * Obtener todos los usuarios (sin mostrar la contraseña)
 */
const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_usuario,
        id_empresa,
        codigo_empleado,
        nombre,
        apellido,
        correo,
        id_rol,
        estado,
        ultimo_login,
        fecha_creacion
      FROM usuarios
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Crear un nuevo usuario con clave hasheada
 */
const crearUsuario = async (req, res) => {
  const {
    id_empresa,
    codigo_empleado,
    nombre,
    apellido,
    correo,
    clave,
    id_rol,
    estado,
  } = req.body;

  try {
    // Hashea la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(clave, 10);

    await pool.query(`
      INSERT INTO usuarios (
        id_empresa,
        codigo_empleado,
        nombre,
        apellido,
        correo,
        password_hash,
        id_rol,
        estado,
        fecha_creacion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
    `, [
      id_empresa,
      codigo_empleado,
      nombre,
      apellido,
      correo,
      hashedPassword,
      id_rol,
      estado
    ]);

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Actualizar los datos de un usuario (sin tocar la contraseña)
 */
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const {
    id_empresa,
    codigo_empleado,
    nombre,
    apellido,
    correo,
    id_rol,
    estado
  } = req.body;

  try {
    await pool.query(`
      UPDATE usuarios SET
        id_empresa = $1,
        codigo_empleado = $2,
        nombre = $3,
        apellido = $4,
        correo = $5,
        id_rol = $6,
        estado = $7
      WHERE id_usuario = $8
    `, [
      id_empresa,
      codigo_empleado,
      nombre,
      apellido,
      correo,
      id_rol,
      estado,
      id
    ]);

    res.json({ message: "Usuario actualizado exitosamente" });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Eliminar un usuario de forma permanente
 */
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM usuarios WHERE id_usuario = $1", [id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: err.message });
  }
};

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
  const empleados = req.body;

  if (!Array.isArray(empleados) || empleados.length === 0) {
    return res.status(400).json({ error: "Debe enviar un array de empleados válido." });
  }

  try {
    for (const emp of empleados) {
      const {
        codigo_empleado,
        nombre,
        apellido,
        correo,
        id_empresa
      } = emp;

      // Validación de campos mínimos
      if (!codigo_empleado || !nombre || !apellido || !correo || !id_empresa) {
        console.log("Empleado inválido:", emp);
        continue; // Se lo brinca si falta algo
      }

      // Generar clave automática → ej: sramirezEMP0
      const primeraLetra = nombre.trim().charAt(0).toLowerCase();
      const apellidoLimpio = apellido.trim().toLowerCase();
      const codigoRecortado = codigo_empleado.trim().slice(0, 4);
      const claveGenerada = `${primeraLetra}${apellidoLimpio}${codigoRecortado}`;

      const passwordHash = await bcrypt.hash(claveGenerada, 10);

      // Insertar en base de datos
      await pool.query(
        `INSERT INTO usuarios (id_empresa, codigo_empleado, nombre, apellido, correo, password_hash, id_rol, estado, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, $6, 2, true, NOW())`,
        [id_empresa, codigo_empleado, nombre, apellido, correo, passwordHash]
      );

      console.log(`Empleado ${nombre} ${apellido} insertado ✅`);
    }

    res.status(200).json({ message: "Empleados importados correctamente." });

  } catch (err) {
    console.error("Error al importar empleados:", err);
    res.status(500).json({ error: "Error al importar empleados." });
  }
};


module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarClave,
  importarEmpleados,
};
