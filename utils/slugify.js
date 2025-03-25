/**
 * Genera un slug limpio a partir del nombre de la empresa
 * Reemplaza tildes, convierte a minúsculas, elimina caracteres raros
 */
const generarSlug = (nombreEmpresa) => {
    return nombreEmpresa
      .normalize("NFD") // quita tildes
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // reemplaza espacios y símbolos por guiones
      .replace(/(^-|-$)/g, ""); // elimina guiones al principio/final
  };
  
  module.exports = generarSlug;
  