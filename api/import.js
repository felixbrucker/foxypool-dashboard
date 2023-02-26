const db = require('../lib/services/db')
const Export = require('../lib/services/db/export')
const loggingMiddleware = require('../lib/logging-middleware')

module.exports = loggingMiddleware(async (req, res) => {
  const shareKey = req.query.shareKey;
  if (!shareKey) {
    return res
      .status(400)
      .json({ error: 'Invalid params!' })
  }
  await db.init()
  const existingExport = await Export.findOne({ shareKey })
  if (!existingExport) {
    return res
      .status(404)
      .json({ error: 'Unknown export!' })
  }

  return res.json(existingExport.pools);
})
