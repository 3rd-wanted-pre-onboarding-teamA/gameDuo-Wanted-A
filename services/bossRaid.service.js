const redis = require("redis");
const redisPool = require("../db/redisConfig");

class BossRaidService {
  // 중복되지 않는 raidRecordId 생성
  static async createId(userId, level) {
    const sql = `INSERT INTO boss_raid (user_id, boss_raid_level) VALUES (?)`;
    const values = [[userId, level]];
    let connection = null;
    try {
      connection = await pool.getConnection(async (conn) => conn);
      return await connection.query(sql, values);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  }

  // 게임 시작 가능하면 raidStatus에 raidRecordId 넣기
  static putRaidRecordId = async function (raidRecordId) {
    const client = redis.createClient(redisPool);
    try {
      await client.connect();
      await client.set("raidStatus", raidRecordId);
    } catch {
      throw err;
    } finally {
      await client.disconnect();
    }
  };

  static levelCahceToRedis = async function () {
    // 게임 레벨 별 점수 관련 static data 캐싱 (Redis 사용)
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
  };

  static putStaticData = async function (data) {
    // redis 캐시에 점수관련 static data 없으면 캐싱하기
    const client = redis.createClient(redisPool);
    try {
      await client.connect();
      await client.set("bossRaidData", data);
    } catch (err) {
      throw err;
    } finally {
      await client.disconnect();
    }
  };

  static delRedisStatus = async function () {
    // redisStatus 삭제 (게임 종료 후)
    const client = redis.createClient(redisPool);
    try {
      await client.connect();
      await client.del("raidStatus");
    } catch (err) {
      throw err;
    } finally {
      await client.disconnect();
    }
  };

  // 게임 끝난 후 점수 합산을 위한 boss_raid_level 찾기 (boss_raid table)
  static findLevel = async function (raidRecordId) {
    const sql = `SELECT user_id, boss_raid_level, enter_time FROM boss_raid WHERE raid_record_id=${raidRecordId}`;
    let connection = null;
    try {
      connection = await pool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  };

  // 게임 끝난 후 점수 합산을 위한 총점 찾기 (user table)
  static findTotalScore = async function (userId) {
    const sql = `SELECT score FROM user WHERE user_id=${userId}`;
    let connection = null;
    try {
      connection = await pool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  };

  // 게임 끝난 후 게임 종료 시간 입력
  static putEndTime = async function (raidRecordId, end_time) {
    const sql = `UPDATE boss_raid SET end_time="${end_time}" WHERE raid_record_id=${raidRecordId}`;
    let connection = null;
    try {
      connection = await pool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  };

  // fail 저장
  static setSuccess = async function (raidRecordId) {
    const sql = `UPDATE boss_raid SET success=true WHERE raid_record_id=${raidRecordId}`;
    let connection = null;
    try {
      connection = await pool.getConnection(async (conn) => conn);
      return await connection.query(sql);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      connection.release();
    }
  };
}

module.exports = BossRaidService;
