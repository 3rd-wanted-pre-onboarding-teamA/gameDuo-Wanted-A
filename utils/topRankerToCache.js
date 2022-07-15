const BossRaidService = require("../services/bossRaid.service");
const response = require("./response");

const topRankerToCache = async () => {
  /**
   * 기능: mysql에서 받아온 TopRanker를 캐시에 설정
   * 작성자: 허정연
   */
  let rankingInfoData = [];
  try {
    rankingInfoData = await BossRaidService.topRankerInfoListSelect();
    await BossRaidService.setTopRankerToCache(rankingInfoData[0]);
    console.log(response.RANKING_RESET);
  } catch (err) {
    console.log(err);
    res.status(500).json(response.INTERNAL_SERVER_ERROR);
  }
};

module.exports = topRankerToCache;
