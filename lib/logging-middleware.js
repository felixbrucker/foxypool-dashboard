const logger = require('./services/logger');

module.exports = (next) => {
  return async (req, res) => {
    const start = Date.now();
    const message = `${req.method} ${req.url}`;
    try {
      await next(req, res);
    } finally {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      logger.log({level: 'trace', msg: `HTTP | ${(Date.now()-start).toString().padStart(5, ' ')} ms | [${ip}] | ${res.statusCode} ${message}`});
    }
  };
};
