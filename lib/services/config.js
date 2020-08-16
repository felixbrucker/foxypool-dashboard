class Config {
  constructor() {
    this.mongodbUri = process.env.MONGODB_URI;
  }
}

module.exports = new Config();
