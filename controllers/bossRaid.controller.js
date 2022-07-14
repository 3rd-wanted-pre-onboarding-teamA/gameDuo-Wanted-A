const BossRaidService = require("../services/bossRaid.service");
const RankingInfo = require("../models/RankingInfo.model");

class BossRaidController {
  static bossRaidStatus = async function (req, res) {
    try {
      let raidStatus = await BossRaidService.bossRaidStatus();
      if (!raidStatus) {
        return res.status(200).json({canEnter: 0});
      } else {
        return res.status(200).json({
          canEnter: 1,
          enteredUserId: raidStatus
        });
      }
    } catch (err) {
      throw err;
    }
  };

  static topRankerList = async function (req, res) {
    /*
      랭킹 조회
      - top10 랭킹은 redis에서 조회
      - 내 랭킹은 mysql에서 조회
    */
    const { userId }  = req.body;
    let rankingInfoData = [];
    let rankingInfoJsonArr = [];

    try {
      rankingInfoJsonArr = await BossRaidService.topRankerInfoList();
      rankingInfoJsonArr = JSON.parse(rankingInfoJsonArr);
      for (let i = 0; i < rankingInfoJsonArr.length; i++) {
        rankingInfoData.push(new RankingInfo(i, rankingInfoJsonArr[i].user_id, rankingInfoJsonArr[i].score));
      }
      const [myRankingInfoData] = await BossRaidService.myRankingInfo(userId);
      res.status(200).json({
        topRankerInfoList: rankingInfoData,
        myRankingInfo: myRankingInfoData[0] 
      });
    } catch (err) {
      throw err;
    } 
  };

  static topRankerToCache = async function (req, res) {
    /*
      mysql에서 받아온 TopRanker를 캐시에 설정
      1. 서버 시작시 동작
      2. 게임 끝날 때 동작
    */
    let rankingInfoData = [];
    try {
      rankingInfoData = await BossRaidService.topRankerInfoListSelect();
      await BossRaidService.setTopRankerToCache(rankingInfoData[0]);
      console.log("랭킹이 재설정되었습니다.");
    } catch (err) {
      throw err;
    }
  };
}

module.exports = BossRaidController;