const pool = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generarSlug = require("../utils/slugify");
const { registrarBitacora, registrarError } = require("../utils/logger");

/**
 * Login de administrador con JWT
 ***/
const loginAdmin = async (req, res) => {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ error: "Correo y clave requeridos" });
  }

  try {
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1 AND id_rol = 1", // solo admins
      [correo]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuario = resultado.rows[0];
    const claveValida = await bcrypt.compare(clave, usuario.password_hash);

    if (!claveValida) {
      return res.status(401).json({ error: "Clave incorrecta" });
    }

    // 🎯 Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_empresa: usuario.id_empresa,
        correo: usuario.correo,
        rol: usuario.id_rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.status(200).json({
      message: "Login exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        id_empresa: usuario.id_empresa
      }
    });
  } catch (error) {
    console.error("Error en loginAdmin:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};



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
      const check = await pool.query(
        "SELECT * FROM empresas WHERE slug_empresa = $1",
        [slug]
      );
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
      return res
        .status(403)
        .json({ error: "No tiene permisos de administrador." });
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

        // Registrar sesión activa
        await pool.query(
          `INSERT INTO sesiones_activas (id_usuario, id_empresa, ip, user_agent, estado)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            usuario.id_usuario,
            usuario.id_empresa,
            req.info_sesion?.ip || "IP no disponible",
            req.info_sesion?.user_agent || "Desconocido",
            true // Estado activo
          ]
        );
    res.status(200).json({
      message: "Login exitoso",
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      id_empresa: usuario.id_empresa,
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
    const slugLimpiado = slug.trim().toLowerCase();
    const empresaResult = await pool.query(
      "SELECT id_empresa FROM empresas WHERE slug_empresa = $1",
      [slugLimpiado]
    );
   // console.log(
    //  `SELECT id_empresa FROM empresas WHERE slug_empresa = '${slug}'`
    //);

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
      return res
        .status(403)
        .json({ error: "No tiene permiso para acceder como empleado." });
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
      id_empresa: empleado.id_empresa,
      rol: empleado.id_rol,
      nombre_usuario: `${empleado.nombre} ${empleado.apellido}`,
      slug_empresa: slug
    });
  } catch (err) {
    console.error("Error en login de empleado:", err);
    await registrarError("error", err.message, "loginEmpleado");
    res.status(500).json({ error: "Error interno del servidor." });
  }
};


const cerrarSesion = async (req, res) => {
  const { id_usuario, id_empresa } = req.body;

  if (!id_usuario || !id_empresa) {
    return res.status(400).json({ error: "Faltan datos obligatorios para cerrar sesión." });
  }

  try {
    // Buscar la sesión activa más reciente
    const sesionActiva = await pool.query(
      `SELECT id_sesion FROM sesiones_activas
       WHERE id_usuario = $1 AND id_empresa = $2 AND estado = 'true'
       ORDER BY fecha_inicio DESC
       LIMIT 1`,
      [id_usuario, id_empresa]
    );

    if (sesionActiva.rowCount === 0) {
      return res.status(404).json({ error: "No se encontró sesión activa para este usuario." });
    }

    const id_sesion = sesionActiva.rows[0].id_sesion;

    // Cerrar la sesión
    await pool.query(
      `UPDATE sesiones_activas
       SET fecha_fin = NOW(), estado = false
       WHERE id_sesion = $1`,
      [id_sesion]
    );

    // Registrar en bitácora
    await registrarBitacora(
      id_usuario,
      id_empresa,
      "CERRAR_SESION",
      `Sesión ${id_sesion} cerrada correctamente`
    );

    res.status(200).json({ message: "Sesión cerrada exitosamente." });

  } catch (err) {
    console.error("Error al cerrar sesión:", err.message);
    await registrarError("error", err.message, "cerrarSesion");
    res.status(500).json({ error: "Error al cerrar sesión." });
  }
};



module.exports = {
  registrarEmpresaYAdmin,
  loginAdministrador,
  loginEmpleado,
  cerrarSesion,
  loginAdmin ,
};
