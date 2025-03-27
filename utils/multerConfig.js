const multer = require("multer");
const path = require("path");

// Carpeta destino (asegurate que exista /uploads o se crea dinámicamente)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/pdfs/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombreUnico = `pdf_${Date.now()}${ext}`;
    cb(null, nombreUnico);
  }
});

// Filtro solo PDFs
const fileFilter = (req, file, cb) => {
  const isPdf = file.mimetype === "application/pdf";
  if (isPdf) cb(null, true);
  else cb(new Error("Solo se permiten archivos PDF."));
};

// Límite de tamaño: 10 MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;
