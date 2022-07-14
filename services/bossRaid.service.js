const redis = require("redis");
const mysqlPool = require("../db/mysqlConfig");
const redisPool = require("../db/redisConfig");

class BossRaidService {
  static async bossRaidStatus() {
    /**
     * 기능: 보스레이드 상태 조회
     * 작성자: 장덕수
     */
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

  static async createId(userId, level) {
    /**
     * 기능: 중복되지 않는 raidRecordId 생성
     * 작성자: 이승연
     */
    const sql = `INSERT INTO boss_raid (user_id, boss_raid_level) VALUES (?)`;
    const values = [[userId, level]];
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql, values);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async putRaidRecordId(raidRecordId) {
    /**
     * 기능: 게임 시작 가능시 raidStatus에 raidRecordId 넣기
     * 작성자: 이승연
     */
    const client = redis.createClient(redisPool);
    try {
        await client.connect();
        await client.set("raidStatus", raidRecordId);
    } catch {
        throw err;
    } finally {
        await client.disconnect();
    }
  }

  static async levelCahceToRedis() {
    /**
     * 기능: 게임 레벨 별 점수 관련 static data 캐싱 (Redis 사용)
     * 작성자: 이승연
     */
    const client = redis.createClient(redisPool);
    try {
        await client.connect();
        let staticData = await client.get("bossRaidData");
        return staticData;
    } catch (err) {
        throw err;
    } finally {
        await client.disconnect();
    }
  }

  static async putStaticData(data) {
    /**
     * 기능: redis 캐시에 점수관련 static data 없으면 캐싱하기
     * 작성자: 이승연
     */
    const client = redis.createClient(redisPool);
    try {
        await client.connect();
        await client.set("bossRaidData", data);
    } catch (err) {
        throw err;
    } finally {
        await client.disconnect();
    }
  }

  static async delRedisStatus() {
    /**
     * 기능: redisStatus 삭제 (게임 종료 후)
     * 작성자: 이승연
     */
    const client = redis.createClient(redisPool);
    try {
        await client.connect();
        await client.del("raidStatus");
    } catch (err) {
        throw err;
    } finally {
        await client.disconnect();
    }
  }

  static async findLevel(raidRecordId) {
    /**
     * 기능: 게임 끝난 후 점수 합산을 위한 boss_raid_level 찾기 (boss_raid table)
     * 작성자: 이승연
     */
    const sql = `SELECT user_id, boss_raid_level, enter_time FROM boss_raid WHERE raid_record_id=${raidRecordId}`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async findTotalScore(userId) {
    /**
     * 기능: 게임 끝난 후 점수 합산을 위한 총점 찾기 (user table)
     * 작성자: 이승연
     */
    const sql = `SELECT * FROM user WHERE user_id=${userId}`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async putEndTime(raidRecordId, end_time) {
    /**
     * 기능: 게임 끝난 후 게임 종료 시간 입력
     * 작성자: 이승연
     */
    const sql = `UPDATE boss_raid SET end_time="${end_time}" WHERE raid_record_id=${raidRecordId}`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async setSuccess(raidRecordId) {
    /**
     * 기능: boss_raid테이블에 success 상태 업데이트
     * 작성자: 이승연
     */
    const sql = `UPDATE boss_raid SET success=true WHERE raid_record_id=${raidRecordId}`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async updateTotalScore(userId, score) {
    /**
     * 기능: 유저 테이블에 총점 업데이트
     * 작성자: 이승연
     */
    const sql = `UPDATE user SET score=${score} WHERE user_id=${userId}`;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async topRankerInfoList() {
    /**
     * 기능: Top 10 랭커 redis에서 추출
     * 작성자: 허정연
     */
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
    /**
     * 기능: 내 랭킹 조회
     * 작성자: 허정연
     */
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
    /**
     * 기능: Top 10 랭커 mysql에서 추출
     * 작성자: 허정연
     */
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
    /**
     * 기능: Top 10 랭커 redis cache에 설정
     * 작성자: 허정연
     */
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