const axios = require("axios");
const BossRaidService = require("../services/bossRaid.service");

const getStaticData = async () => {
    /**
   * 기능: staticData 레디스에 저장
   * 작성자: 이승연
   */
  let value = await BossRaidService.levelCahceToRedis();
  let bossRaidLimitSeconds, levels;
  if (value) {
    bossRaidLimitSeconds = JSON.parse(value).bossRaids[0].bossRaidLimitSeconds;
    levels = JSON.parse(value).bossRaids[0].levels;
    console.log("from cached data");
  } else {
    const { data } = await axios.get(
      "https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json"
    );
    await BossRaidService.putStaticData(JSON.stringify(data));
    console.log("from source data");
    bossRaidLimitSeconds = data.bossRaids[0].bossRaidLimitSeconds;
    levels = data.bossRaids[0].levels;
  }
  return { 
    bossRaidLimitSeconds: bossRaidLimitSeconds, 
    levels: levels };
}

module.exports = getStaticData;