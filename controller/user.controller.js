const { default: axios } = require("axios");
const UserService = require("../services/user.service.js");

class UserController {
  static signup = async function (req, res) {
    try {
      await UserService.createUser();
      res.status(201).json({ message: "새로운 아이디가 생겼습니다." });
    } catch (err) {
      throw err;
    }
  };

  static getAllId = async function (req, res) {
    try {
      const result = await UserService.getAllUser();
      res.status(200).json({ message: "모든 사용자를 가지고 왔습니다.", result: result });
    } catch (err) {
      throw err;
    }
  };

  static getIdInfo = async function (req, res) {
    let id = req.id;
    try {
      const [result] = await UserService.getUserInfo(id);
      res.status(201).jsson({
        message: "모든 id가 조회되었습니다.",
        deletedList: result,
      });
    } catch (err) {
      throw err;
    }
  };
}

module.exports = UserController;
