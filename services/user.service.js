const pool1 = require("../db/mysqlConfig");

class UserService {
  static async createUser() {
    const sql = `INSERT INTO user values ();`;
    // const values = [[score]];
    let connection = null;
    try {
      connection = await pool1.getConnection(async (conn) => conn);
      const [result] = await connection.query(sql);
      console.log("result?", result);
      return result;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }
  static async getAllUser() {
    const sql = `SELECT * from user;`;
    // const values = [[score]];
    let connection = null;
    try {
      connection = await pool1.getConnection(async (conn) => conn);
      const [result] = await connection.query(sql);
      return result;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }

  static async getUserInfo(userId) {
    const sql1 = `SELECT score FROM user WHERE user_id = ${userId}`;
    const sql2 = `SELECT * FROM boss_raid WHERE user_id = ${userId}`;
    let connection = await pool1.getConnection(async (conn) => conn);
    try {
      const [result] = await connection.query(sql1);
      return result;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }
}

// MySQL 클라이언트 가져오기
// const mysql = require("mysql2");

// // 데이터베이스와 연결
// const connection = mysql.createConnection({
//   host: "127.0.0.1",
//   port: 3306,
//   user: "root",
//   password: "password",
//   database: "gameduo",
// });

// // 간단한 쿼리
// connection.query("SELECT * FROM user", function (err, results, fields) {
//   console.log(results); // results는 서버로부터 반환된 행들을 포함한다.
//   console.log(fields); // fields는 results에 관한 부가적인 메타데이터들을 포함한다.
// });

// async function run() {}
// let myuser = new Users();
// let result = await myuser.test();
// console.log(result);
// const createUser = async (score) => {
//   const sql = `INSERT INTO user values ?`;
//   // const values = [[score]];
//   let connection = await pool.getConnection(async (conn) => conn);
//   try {
//     return await connection.query(sql, [score]);
//   } catch (err) {
//     throw err;
//   } finally {
//     console.log("final");
//     connection.release();
//   }
// };

// createUser();

module.exports = UserService;
