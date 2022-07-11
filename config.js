const dotenv = require("dotenv");
dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`key ${key} is undefined`);
  }
  return value;
}

const config = {
  // redisInfo - redis 관련 정보
  redisInfo: {
    host: required("HOST"),
    port: required("REDIS_PORT"),
    db: required("DB_NUM"),
    password: required("REDIS_PW"),
    url: required("REDIS_URL"),
  },
  port: parseInt(required("PORT", 3000)),
  cors: {
    allowedOrigin: required("CORS_ALLOW_ORIGIN"),
  },
};

module.exports = {
  config,
};
