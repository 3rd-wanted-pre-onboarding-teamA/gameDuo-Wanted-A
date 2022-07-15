const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");
const app = express();
const BossRaidController = require("./controllers/bossRaid.controller");
const dotenv = require("dotenv");
dotenv.config();

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

BossRaidController.topRankerToCache();