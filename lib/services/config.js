class Config {
  constructor() {
    this.mongodbUri = process.env.MONGODB_URI
    this.exportExpirationDurationInSeconds = 7 * 24 * 60 * 60
  }
}

module.exports = new Config();
