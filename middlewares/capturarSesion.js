const capturarSesion = (req, res, next) => {
    req.info_sesion = {
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      user_agent: req.headers["user-agent"]
    };
    next();
  };
  
  module.exports = capturarSesion;
  