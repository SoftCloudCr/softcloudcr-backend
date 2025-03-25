const pool = require("../models/db");
const bcrypt = require("bcrypt");
const generarSlug = require("../utils/slugify");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Registra una nueva empresa y un usuario administrador
 */
const registrarEmpresaYAdmin = async (req, res) => {
  const { nombre_empresa, nombre, apellido, correo, clave } = req.body;

  if (!nombre_empresa || !nombre || !apellido || !correo || !clave) {
    
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  // Validar que el correo no exista
const correoExistente = await pool.query(
    "SELECT * FROM usuarios WHERE correo = $1",
    [correo]
  );
  
  if (correoExistente.rowCount > 0) {
    return res.status(400).json({ error: "El correo ya está registrado." });
  }
  

  try {
    // Generar slug base
    let slugBase = generarSlug(nombre_empresa);
    let slug = slugBase;
    let contador = 1;

    // Verificar que el slug no exista ya
    while (true) {
      const check = await pool.query("SELECT * FROM empresas WHERE slug_empresa = $1", [slug]);
      if (check.rowCount === 0) break;
      slug = `${slugBase}-${contador}`;
      contador++;
    }

    // Insertar empresa
    const empresaResult = await pool.query(
      "INSERT INTO empresas (nombre, slug_empresa) VALUES ($1, $2) RETURNING id_empresa",
      [nombre_empresa, slug]
    );

    const id_empresa = empresaResult.rows[0].id_empresa;

    // Hashear la clave
    const passwordHash = await bcrypt.hash(clave, 10);


    // Insertar usuario administrador (id_rol = 1)
    await pool.query(
      `INSERT INTO usuarios (
        id_empresa, codigo_empleado, nombre, apellido, correo, password_hash, id_rol, estado, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, 1, true, NOW())`,
      [
        id_empresa,
        "admin", // código interno fijo para el admin
        nombre,
        apellido,
        correo,
        passwordHash,
      ]
    );

    res.status(201).json({
      message: "Empresa y administrador creados correctamente",
      slug_empresa: slug,
      login_url: `https://softcloudcr.com/empresa/${slug}`,
    });

  } catch (err) {
    console.error("Error al registrar empresa: paver", err);
    res.status(500).json({ error: "Error interno del servidor" });
    console.error("Error al registrar empresa:", err);
  }
};

/**
 * Login de administrador por correo y clave
 */
const loginAdministrador = async (req, res) => {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ error: "Correo y clave son obligatorios." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const usuario = result.rows[0];

    if (usuario.id_rol !== 1) {
      return res.status(403).json({ error: "No tiene permisos de administrador." });
    }

    const claveValida = await bcrypt.compare(clave, usuario.password_hash);
    if (!claveValida) {
      return res.status(401).json({ error: "Clave incorrecta." });
    }

    // 🎯 Registrar bitácora
    await registrarBitacora(
      usuario.id_usuario,
      usuario.id_empresa,
      "LOGIN_ADMIN",
      `Administrador ${usuario.nombre} ${usuario.apellido} inició sesión`
    );

    res.status(200).json({
      message: "Login exitoso",
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      id_empresa: usuario.id_empresa
    });

  } catch (err) {
    console.error("Error en loginAdministrador:", err.message);
    await registrarError("error", err.message, "loginAdministrador");
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

/**
 * Login de empleado usando slug de empresa + código de empleado
 */
const loginEmpleado = async (req, res) => {
    const { slug } = req.params;
    const { codigo_empleado, clave } = req.body;
  
    if (!slug || !codigo_empleado || !clave) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }
    // Justo antes de insertar la empresa

    try {
      // Buscar ID de la empresa usando el slug
      const slugLimpiado = slug.trim().toLowerCase();;
      const empresaResult = await pool.query(
        "SELECT id_empresa FROM empresas WHERE slug_empresa = $1",
        [slugLimpiado]
      );
      console.log(`SELECT id_empresa FROM empresas WHERE slug_empresa = '${slug}'`);

      if (empresaResult.rowCount === 0) {
        return res.status(404).json({ error: "Empresa no encontrada." });
      }
  
      const id_empresa = empresaResult.rows[0].id_empresa;
  
      // Buscar empleado con ese código dentro de esa empresa
      const userResult = await pool.query(
        "SELECT * FROM usuarios WHERE id_empresa = $1 AND codigo_empleado = $2",
        [id_empresa, codigo_empleado]
      );
  
      if (userResult.rowCount === 0) {
        return res.status(404).json({ error: "Empleado no encontrado." });
      }
  
      const empleado = userResult.rows[0];
  
      // Validar que sea rol empleado (id_rol = 2)
      if (empleado.id_rol !== 2) {
        return res.status(403).json({ error: "No tiene permiso para acceder como empleado." });
      }
  
      // Validar clave
      const claveValida = await bcrypt.compare(clave, empleado.password_hash);
  
      if (!claveValida) {
        return res.status(401).json({ error: "Clave incorrecta." });
      }
  
    // 🎯 Registrar bitácora
    await registrarBitacora(
      empleado.id_usuario,
      empleado.id_empresa,
      "LOGIN_EMPLEADO",
      `Empleado ${empleado.nombre} ${empleado.apellido} inició sesión`
    );

      // Si todo bien, devolver info básica
      res.status(200).json({
        message: "Login exitoso",
        id_usuario: empleado.id_usuario,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        codigo_empleado: empleado.codigo_empleado,
        id_empresa: empleado.id_empresa
      });
  
    } catch (err) {
      console.error("Error en login de empleado:", err);
      await registrarError("error", err.message, "loginEmpleado");
      res.status(500).json({ error: "Error interno del servidor." });
    }
  };
  




module.exports = {
  registrarEmpresaYAdmin,
  loginAdministrador,
  loginEmpleado,
};
