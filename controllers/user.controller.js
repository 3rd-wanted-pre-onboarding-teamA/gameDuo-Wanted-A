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
      //const scoreData =  await UserService.bossRaidData();

      console.log(score, records);
      
      const recordsList = records.map(async(item) => {
        console.log(item.level, item.success);
        item.score = await UserService.getRaidScore(item.level, item.success);
        return item;
      });
      const result = {
        "totalScore": score,
        "bossRaidHistory": recordsList
      }
      console.log(result);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json(response.INTERNAL_SERVER_ERROR);
    }
  };
}

module.exports = UserController;