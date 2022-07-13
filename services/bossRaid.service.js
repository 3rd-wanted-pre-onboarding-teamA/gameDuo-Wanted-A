const redis = require("redis");
const mysqlPool = require("../db/mysqlConfig");
const redisPool = require("../db/redisConfig");

class BossRaidService {
  static bossRaidStatus = async function () {
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
}

module.exports = BossRaidService;