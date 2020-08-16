const mongoose = require('mongoose');

const exportSchema = new mongoose.Schema({
  shareKey: String,
  pools: [],

  createdAt: Date,
});

exportSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc._id;
  delete doc.__v;

  return doc;
};

module.exports = mongoose.model('Export', exportSchema);
