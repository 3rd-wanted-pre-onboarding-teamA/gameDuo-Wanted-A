const dotenv = require("dotenv");
dotenv.config();

const pool2 = {
  redisInfo: {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
    db: process.env.DB_NUM,
    password: process.env.REDIS_PW,
    // url: required("REDIS_URL"),
  },
};

module.exports = pool2;
