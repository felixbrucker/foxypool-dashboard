const moment = require('moment');

const db = require('./services/db');
const Export = require('./services/db/export');

module.exports = (next) => {
  return async (req, res) => {
    try {
      await next(req, res);
    } finally {
      await db.init();
      await Export.deleteMany({
        createdAt: {
          $lt: moment().subtract(1, 'week').toDate(),
        },
      });
    }
  };
};
