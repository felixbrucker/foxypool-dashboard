const mongoose = require('mongoose')

const config = require('../config')

const exportSchema = new mongoose.Schema({
  shareKey: {
    type: String,
    unique: true,
  },
  pools: [],
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
  autoIndex: true,
  strictQuery: false,
})

exportSchema.methods.toJSON = function () {
  const doc = this.toObject()
  delete doc._id
  delete doc.__v

  return doc
}

exportSchema.index({ createdAt: 1 }, { expireAfterSeconds:  config.exportExpirationDurationInSeconds })

module.exports = mongoose.model('Export', exportSchema)
