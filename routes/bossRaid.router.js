const express = require("express");
const BossRaidController = require("../controllers/bossRaid.controller")
const router = express.Router();

router.get("/", BossRaidController.bossRaidStatus);
router.post("/enter");
router.patch("/end");
router.get("/topRankerList");

module.exports = router;
