const express = require("express");
const router = express.Router();
const bossRaidController = require("../controller/bossRaid.controller.js");

router.get("/");
router.post("/enter", bossRaidController.startBossRaid);
router.patch("/end", bossRaidController.stopBossRaid);
router.get("/topRankerList");

module.exports = router;
