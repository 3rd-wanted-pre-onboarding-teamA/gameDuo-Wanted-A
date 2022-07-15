const express = require("express");
const router = express.Router();

const userRouter = require("./user.router.js");
const bossRaidRouter = require("./bossRaid.router.js");

router.use("/", userRouter);;
router.use("/bossRaid", bossRaidRouter);

module.exports = router;