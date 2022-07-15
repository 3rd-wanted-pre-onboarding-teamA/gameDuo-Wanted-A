const { default: axios } = require("axios");
const UserService = require("../services/user.service.js");
const response = require("../utils/response");

class UserController {
  /**
   * 기능: 유저 생성, 정보 조회
   * 작성자: 황선영
   */
  static async signup (req, res) {
    try {
      await UserService.createUser();
      res.status(201).json(response.NEW_USERID);
    } catch (err) {
      res.status(500).json(response.INTERNAL_SERVER_ERROR);
    }
  };

  static async getInfo (req, res) {
    const userId = req.params.userId;
    try {
      const score = await UserService.getUserScore(userId);
      const records = await UserService.getUserRecord(userId);
      const result = {
        "totalScore": score,
        "bossRaidHistory": records
      }
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json(response.INTERNAL_SERVER_ERROR);
    }
  };
}

module.exports = UserController;