const express = require("express");
const router = express.Router();
const BossRaidController = require("../controllers/bossRaid.controller")

router.get("/", BossRaidController.bossRaidStatus);
router.post("/enter", BossRaidController.startBossRaid);
router.patch("/end", BossRaidController.stopBossRaid);
router.get("/topRankerList", BossRaidController.topRankerList);

module.exports = router;
