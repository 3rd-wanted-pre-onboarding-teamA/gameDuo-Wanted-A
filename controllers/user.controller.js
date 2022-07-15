const { default: axios } = require("axios");
const UserService = require("../services/user.service.js");
const response = require("../utils/response");

class UserController {
  /**
   * 기능: 유저 생성, 정보 조회
   * 작성자: 황선영
   */
  static signup = async function (req, res) {
    try {
      await UserService.createUser();
      res.status(201).json(response.NEW_USERID);
    } catch (err) {
      res.status(500).json(response.INTERNAL_SERVER_ERROR);
    }
  };

  static getInfo = async function (req, res) {
    const userId = req.params.userId;
    try {
      const result = await UserService.getUserInfo(userId);
      res.status(201).json(result);
    } catch (err) {
      res.status(500);
    }
  };

}

module.exports = UserController;