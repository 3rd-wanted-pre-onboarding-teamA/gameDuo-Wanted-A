const redis = require("redis");
const mysqlPool = require("../db/mysqlConfig");
const redisPool = require("../db/redisConfig");

class BossRaidService {
  static bossRaidStatus = async function () {
    // 보스레이드 상태 조회
    const client = redis.createClient(redisPool);
    try {
      await client.connect();
      const status = await client.get("raidStatus");
      return parseInt(status, 10);
    } catch (err) {
      throw err;
    } finally {
      await client.disconnect();
    }
  };

  static async topRankerInfoList() {
    // Top 10 랭커 redis에서 추출
    let client = null;
    try {
      client = redis.createClient(redisPool);
      await client.connect();
      try {
        return await client.get("topRankerInfoList");
      } catch (err) {
        throw err;
      }
    } catch (err) {
      throw err;
    } finally {
      await client.disconnect();
    }
  }

  static async myRankingInfo(userId) {
    // 내 랭킹 조회
    const sql = `select * from (select row_number() over(order by score desc) as ranking, user_id as "userId", score as "totalScore" from user)r where userId = ${userId}`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }

  static async topRankerInfoListSelect() {
    // Top 10 랭커 mysql에서 추출
    const sql = `select * from user order by score desc limit 10`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }

  static async setTopRankerToCache(rankingInfoData) {
    // Top 10 랭커 redis cache에 설정
    let client = null;
    try {
      client = redis.createClient(redisPool);
      await client.connect();
      try {
        await client.set("topRankerInfoList", JSON.stringify(rankingInfoData));
      } catch (err) {
        throw err;
      }
    } catch (err) {
      throw err;
    } finally {
      await client.disconnect();
    }
  }
}

module.exports = BossRaidService;