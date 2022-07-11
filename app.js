const { config } = require("./config.js");
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const router = require("./router/index.js");
const redis = require("redis");

// Redis 연동 부분
async function run() {
  const client = redis.createClient();

  await client.connect();
  console.log("Redis Server Opened??:", client.isOpen);

  await client.disconnect();
}
run();

const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
};

const app = express();

app.use(express.json());
app.use(cors(corsOption));
app.use(morgan("tiny"));

app.use("/", router);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

console.log("Server start!!!");

app.get("/", (req, res, next) => {
  res.send("Hello from API Server");
});

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
