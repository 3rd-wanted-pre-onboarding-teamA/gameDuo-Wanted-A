const res = require("express/lib/response");
const mysqlPool = require("../db/mysqlConfig");

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
      const [result] = await connection.query(sql);
      return result;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }

  static async getUserInfo(userId) {
    const sql1 = `SELECT * FROM user WHERE user_id = ${userId}`;
    const sql2 = `SELECT raid_record_id as raidRecordId, enter_time as enterTime, end_time as endTime FROM boss_raid WHERE user_id = ${userId}`;
    let connection = await mysqlPool.getConnection(async (conn) => conn);

    try {
      const [[result]] = await connection.query(sql1);
      const [result2] = await connection.query(sql2);
      const userInfoObj = {
        "totalScore": result.score,
        "bossRaidHistory": result2
      }
      return userInfoObj;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = UserService;