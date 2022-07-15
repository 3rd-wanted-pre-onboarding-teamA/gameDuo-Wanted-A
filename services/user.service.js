const res = require("express/lib/response");
const mysqlPool = require("../db/mysqlConfig");
const axios = require("axios");
const getStaticData = require("../utils/getStaticData");
class UserService {

  static async createUser() {
    /**
     * 기능: user 생성, 조회
     * 작성자: 황선영
     */
    const sql = `INSERT INTO user values ();`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      await connection.query(sql);
    } catch (err) {
      console.log(err);
    } finally {
      connection.release();
    }
  }

  static async getUserScore(userId) {
    const sql = `SELECT * FROM user WHERE user_id = ${userId}`;
    let connection = await mysqlPool.getConnection(async (conn) => conn);

    try {
      const [[result]] = await connection.query(sql);
      return result.score;
    } catch (err) {
      console.log(err);
    } finally {
      connection.release();
    }
  }

  static async getUserRecord(userId) {
    const sql = `SELECT raid_record_id as raidRecordId, enter_time as enterTime, end_time as endTime, boss_raid_level as level, success FROM boss_raid WHERE user_id = ${userId}`;
    let connection = await mysqlPool.getConnection(async (conn) => conn);
    try {
      const [result2] = await connection.query(sql);
      return result2;
    } catch (err) {
      console.log(err);
    } finally {
      connection.release();
    }
  }

  static async getRaidScore(level, success){
    let data = await getStaticData();
    let result = data.levels[level].score;
    result *= success;
    return result;
  }
}

module.exports = UserService;