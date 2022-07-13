const { config } = require("./config.js");
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const router = require("./router/index.js");
const app = express();

const corsOption = {
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOption));
app.use(morgan("tiny"));

app.use("/", router, (req, res, next) => {
  res.send("Hello from API server");
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
