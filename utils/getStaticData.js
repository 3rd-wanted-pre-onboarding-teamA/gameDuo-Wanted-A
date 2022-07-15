const axios = require("axios");
const BossRaidService = require("../services/bossRaid.service");
const response = require("./response");

const getStaticData = async () => {
    /**
   * 기능: staticData 레디스에 저장
   * 작성자: 이승연
   */
  let value = await BossRaidService.levelCacheToRedis();
  let bossRaidLimitSeconds, levels;
  if (value) {
    console.log(response.STATIC_DATA_CACHE);
    bossRaidLimitSeconds = JSON.parse(value).bossRaids[0].bossRaidLimitSeconds;
    levels = JSON.parse(value).bossRaids[0].levels;
  } else {
    console.log(response.STATIC_DATA_SOURCE);
    const { data } = await axios.get(
      "https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json"
    );
    await BossRaidService.putStaticData(JSON.stringify(data));
    bossRaidLimitSeconds = data.bossRaids[0].bossRaidLimitSeconds;
    levels = data.bossRaids[0].levels;
  }
  return { 
    bossRaidLimitSeconds: bossRaidLimitSeconds, 
    levels: levels };
}

module.exports = getStaticData;