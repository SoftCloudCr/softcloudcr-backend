const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./models/db");
const capturarSesion = require("./middlewares/capturarSesion");
const cuestionariosRoutes = require("./routes/cuestionarios.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use(capturarSesion); 
app.use("/api/cuestionarios", cuestionariosRoutes);

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
