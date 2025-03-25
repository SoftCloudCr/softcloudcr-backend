const pool = require("../models/db");
const bcrypt = require("bcrypt");







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
    console.log("empresa:", empresa);
    console.log("estado:", estado);
    console.log("nombre:", nombre);
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





module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarClave,
  importarEmpleados,
  obtenerEmpleadosConFiltros,
};
