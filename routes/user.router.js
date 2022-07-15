const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");

router.post("/user", UserController.signup);
router.get("/user/:userId", UserController.getInfo);

module.exports = router;