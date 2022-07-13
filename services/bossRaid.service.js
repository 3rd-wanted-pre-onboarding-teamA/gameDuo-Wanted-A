const redis = require("redis");

class BossRaidService {
  static bossRaidStatus = async function () {
    const client = redis.createClient({
      // TODO: 추후 redis URL 경로 지정하기 
      // url: ,
      legacyMode: true
    });
    client.on("connect", () => {
      console.info("Rdedis connected!");
    });
    client.on("error", (err) => {
      console.error("Redis Client Error", err)
    });
    try {
      await client.connect();
      const redisCli = client.v4;
      const status = await redisCli.get("raidStatus");
      return parseInt(status, 10);
    } catch (err) {
      throw err;
    } finally {
      await client.disconnect();
    }
  };
}

module.exports = BossRaidService;