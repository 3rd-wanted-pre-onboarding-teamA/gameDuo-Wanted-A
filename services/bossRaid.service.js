const redis = require("redis");
const mysqlPool = require("../db/mysqlConfig");
const redisPool = require("../db/redisConfig");
const sql = require("../utils/sql");

class BossRaidService {
  static async bossRaidStatus() {
    /**
     * 기능: 보스레이드 상태 조회
     * 작성자: 장덕수
     */
    const client = redis.createClient(redisPool);
    let connection = null;
    try {
      await client.connect();
      const status = await client.get("raidStatus");
      const query = sql.SELECT_USER_ID;
      connection = await mysqlPool.getConnection(async (conn) => conn);
      if (status) {
        const userId = await connection.query(query,[status]);
        return parseInt(userId[0][0].user_id, 10);
      }
      else return null;
    } catch (err) {
      console.log(err);
    } finally {
      await client.disconnect();
      if (connection) {
        connection.release();
      }
    }
  };

  static async createId(userId, level) {
    /**
     * 기능: 중복되지 않는 raidRecordId 생성
     * 작성자: 이승연
     */
    const query = sql.INSERT_BOSS_RAID;
    const values = [[userId, level]];
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query, values);
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async putRaidRecordId(raidRecordId, bossRaidLimitSeconds) {
    /**
     * 기능: 게임 시작 가능시 raidStatus에 raidRecordId 넣기
     * 작성자: 이승연 장덕수
     */
    const client = redis.createClient(redisPool);
    try {
        await client.connect();
        await client.set("raidStatus", raidRecordId);
        await client.expire("raidStatus", bossRaidLimitSeconds);  // 레이드 제한시간 지나면 raidStatus 삭제
    } catch {
      console.log(err);
    } finally {
      await client.disconnect();
    }
  }

  static async levelCacheToRedis() {
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
    } finally {
      await client.disconnect();
    }
  }

  static async findLevel(raidRecordId) {
    /**
     * 기능: 게임 끝난 후 점수 합산을 위한 boss_raid_level 찾기 (boss_raid table)
     * 작성자: 이승연
     */
    const query = sql.SELECT_ALL_BOSS_RAID;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query, [raidRecordId]);
    } catch (err) {
      console.log(err);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async findTotalScore(userId) {
    /**
     * 기능: 게임 끝난 후 점수 합산을 위한 총점 찾기 (user table)
     * 작성자: 이승연
     */
    const query = sql.SELECT_ALL_USER;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query, [userId]);
    } catch (err) {
      console.log(err);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async findRaidRcordId() {
    const query = sql.SELECT_RECORD_ID;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query);
    } catch (err) {
      console.log(err);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async updateBossRaid(raidRecordId, endTime) {
    /**
     * 기능: 게임 끝난 후 게임 종료 시간 입력
     * 작성자: 이승연
     */
    const query = sql.UPDATE_BOSS_RAID + raidRecordId;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query, [endTime]);
    } catch (err) {
      console.log(err);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async updateTotalScore(userId, score) {
    /**
     * 기능: 유저 테이블에 총점 업데이트
     * 작성자: 이승연
     */
    const query = sql.UPDATE_TOTAL_SCORE + userId;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query, [score]);
    } catch (err) {
      console.log(err);
    } finally {
      if (connection) {
        connection.release();
      }
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
      return await client.get("topRankerInfoList");
    } catch (err) {
      console.log(err);
    } finally {
      await client.disconnect();
    }
  }

  static async myRankingInfo(userId) {
    /**
     * 기능: 내 랭킹 조회
     * 작성자: 허정연
     */
    const query = sql.SELECT_MY_RANKING;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query, [userId]);
    } catch (err) {
      console.log(err);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async topRankerInfoListSelect() {
    /**
     * 기능: Top 10 랭커 mysql에서 추출
     * 작성자: 허정연
     */
    const query = sql.SELECT_TOP10_RANKING;
    let connection = null;
    try {
      connection = await mysqlPool.getConnection(async (conn) => conn);
      return await connection.query(query);
    } catch (err) {
      console.log(err);
    } finally {
      if (connection) {
        connection.release();
      }
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
      await client.set("topRankerInfoList", JSON.stringify(rankingInfoData));
    } catch (err) {
      console.log(err);
    } finally {
      await client.disconnect();
    }
  }
}

module.exports = BossRaidService;