const express = require("express");
const router = express.Router();

const { registrarEmpresaYAdmin } = require("../controllers/auth.controller");
const { loginAdministrador } = require("../controllers/auth.controller");
const { loginEmpleado } = require("../controllers/auth.controller");

router.post("/registro", registrarEmpresaYAdmin);
router.post("/login-admin", loginAdministrador);
router.post("/login-empleado/:slug", loginEmpleado);

module.exports = router;
