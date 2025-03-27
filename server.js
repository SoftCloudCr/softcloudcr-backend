const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


const pool = require("./models/db");
const capturarSesion = require("./middlewares/capturarSesion");
const cuestionariosRoutes = require("./routes/cuestionarios.routes");
const preguntasRoutes = require("./routes/preguntas.routes");
const opcionesRoutes = require("./routes/opciones.routes");
const departamentosRoutes = require("./routes/departamentos.routes");
const departamentosEmpleadosRoutes = require("./routes/departamentos.empleados.routes");
const precapacitacionesRoutes = require("./routes/precapacitaciones.routes");
const precapacitacionesArchivosRoutes = require("./routes/precapacitaciones.archivos.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use(capturarSesion); 
app.use("/api/cuestionarios", cuestionariosRoutes);
app.use("/api/preguntas", preguntasRoutes);
app.use("/api/opciones", opcionesRoutes);
app.use("/api/departamentos", departamentosRoutes);
app.use("/api/departamentos-empleados", departamentosEmpleadosRoutes);
app.use("/api/precapacitaciones", precapacitacionesRoutes);
app.use("/api/precapacitaciones/archivos", precapacitacionesArchivosRoutes);



// Habilitar acceso estático a PDF
app.use("/uploads", express.static("uploads"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor backend corriendo 🎯");
});

// Ruta de prueba con PostgreSQL
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error("Error al conectar con PostgreSQL", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
