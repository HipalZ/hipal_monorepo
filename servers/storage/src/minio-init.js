const minio = require("minio");

class Minio {
  #client;

  connect() {
    this.#client = new minio.Client({
      endPoint: "minio-service",
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ROOT_USER,
      secretKey: process.env.MINIO_ROOT_PASSWORD,
    });
  }

  get client() {
    if (!this.#client) {
      throw new Error("Cannot access Minio before connecting");
    }

    return this.#client;
  }
}

const minioInstance = new Minio();

minioInstance.connect();

const minioClient = minioInstance.client;
module.exports = { minioClient };
