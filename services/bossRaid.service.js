const pool = require("../db/mysqlConfig.js");

class BossRaidService {
    // 중복되지 않는 raidRecordId 생성
    static async createId(userId, level) {
        const sql = `INSERT INTO boss_raid (user_id, boss_raid_level) VALUES (?)`;
        const values = [
            [userId, level]
        ];
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

    //
    // static async findUserIdFromBossRaid(raidRecordId) {
    //     const sql = `SELECT user_id FROM boss_raid WHERE raid_record_id=${raidRecordId}`;
    // }

    // 게임 끝난 후 점수 합산을 위한 boss_raid_level 찾기 (boss_raid table)
    static async findLevel(raidRecordId) {
        const sql = `SELECT user_id, boss_raid_level FROM boss_raid WHERE raid_record_id=${raidRecordId}`;
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
    }

    // 게임 끝난 후 점수 합산을 위한 총점 찾기 (user table)
    static async findTotalScore(userId) {
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
    }
}

module.exports = BossRaidService;