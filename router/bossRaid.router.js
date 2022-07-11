const express = require("express");
const router = express.Router();

router.get("/");
router.post("/enter");
router.patch("/end");
router.get("/topRankerList");

module.exports = router;
