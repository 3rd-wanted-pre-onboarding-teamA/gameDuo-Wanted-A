const express = require("express");
const router = express.Router();
const UserController = require("../controller/user.controller");

// 유저 생성
router.post("/person", UserController.signup);
// 유저 조회
router.get("/person", UserController.getIdInfo);

module.exports = router;
