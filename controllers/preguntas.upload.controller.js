const cloudinary = require("../config/cloudinary");

/**
 * Sube una imagen a Cloudinary y devuelve la URL
 */
const subirImagenPregunta = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen." });
    }

    const bufferToBase64 = req.file.buffer.toString("base64");
    const dataUri = "data:" + req.file.mimetype + ";base64," + bufferToBase64;

    const resultado = await cloudinary.uploader.upload(dataUri, {
      folder: "softcloudcr/preguntas",
      resource_type: "image"
    });

    res.status(200).json({
      message: "Imagen subida correctamente.",
      url_imagen: resultado.secure_url
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    res.status(500).json({ error: "Error al subir la imagen." });
  }
};

module.exports = { subirImagenPregunta };
