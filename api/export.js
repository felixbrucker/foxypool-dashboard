const db = require('../lib/services/db')
const Export = require('../lib/services/db/export')
const loggingMiddleware = require('../lib/logging-middleware')

module.exports = loggingMiddleware(async (req, res) => {
  const pools = req.body.pools
  const shareKey = req.body.shareKey
  if (!pools || !shareKey) {
    return res
      .status(400)
      .json({ error: 'Invalid params!' })
  }
  await db.init()
  const existingExport = await Export.findOne({ shareKey })
  if (existingExport) {
    await Export.deleteOne({ shareKey })
  }
  const newExport = new Export({
    shareKey,
    pools,
  })
  await newExport.save()

  return res.status(201).send()
})
