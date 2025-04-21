const express = require("express");
const router = express.Router();

const { registrarEmpresaYAdmin } = require("../controllers/auth.controller");
const { loginAdministrador,cerrarSesion,loginAdmin } = require("../controllers/auth.controller");
const { loginEmpleado } = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken"); // nuevo middleware

router.post("/registro", registrarEmpresaYAdmin);
router.post("/login-admin", loginAdministrador);
router.post("/login-empleado/:slug", loginEmpleado);
router.patch("/cerrar-sesion", cerrarSesion);
router.post("/admin/login", loginAdmin);

router.get("/admin/dashboard", verifyToken, async (req, res) => {
    const usuario = req.usuario; // viene del token
    res.json({
      message: "Acceso autorizado",
      usuario,
    });
  });

module.exports = router;
