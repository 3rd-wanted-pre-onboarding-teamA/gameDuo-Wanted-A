const BossRaidService = require("../services/bossRaid.service");
const RankingInfo = require("../models/rankingInfo.model");
const { setTopRankerToCache } = require('../services/bossRaid.service');
require("date-utils")

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

  // 보스레이드 게임 시작
  static async startBossRaid(req, res) {
    const { userId, level } = req.body;
    const [data] = await BossRaidService.createId(userId, level); // raidRecordId 생성
    const raidRecordId = data.insertId;
    let isEntered = false;

    /**
     * Redis에서 raidStatus가 있으면 이미 사용중이므로 게임 시작이 불가능하고
     * 반대의 경우 게임 시작이 가능하다
     */
    try {
      let raidStatus = await BossRaidService.bossRaidStatus();
      if (raidStatus) {
        // 게임 시작 불가능
        isEntered = true;
        return res.status(400).json({
          message: "이미 게임중인 사용자가 있습니다.",
          isEntered,
        });
      } else {
        // 게임 시작 가능
        await BossRaidService.putRaidRecordId(raidRecordId);
        isEntered = true;
      }
    } catch (err) {
      console.error(err)
      throw err;
    }

    return res.status(201).json({
      message: "BossRaid Start!!",
      isEntered,
      raidRecordId,
    });
  }
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

  // 보스레이드 게임 종료
  static async stopBossRaid(req, res) {
    let singleScore; // 게임 종료 후 총점에 합산할 점수
    const { userId, raidRecordId } = req.body;
    const [totalScore] = await BossRaidService.findTotalScore(userId);
    let { score } = totalScore[0];
    const [data] = await BossRaidService.findLevel(raidRecordId);
    const { user_id, boss_raid_level, enter_time } = data[0];

    /**
     * 게임 레벨 별 점수 관련 static data
     * 💽 Redis에 캐싱하여 사용하기
     */
    try {
      let value = await BossRaidService.levelCahceToRedis();
      let bossRaidLimitSeconds, levels;
      if (value) {
        bossRaidLimitSeconds = JSON.parse(value).bossRaids[0].bossRaidLimitSeconds;
        levels = JSON.parse(value).bossRaids[0].levels;
        console.log("from cached data");
      } else {
        const {data} = await axios.get("https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json");
        await BossRaidService.putStaticData(JSON.stringify(data));
        console.log("from source data");
        bossRaidLimitSeconds = data.bossRaids[0].bossRaidLimitSeconds;
        levels = data.bossRaids[0].levels;
      }

      /*
       * 방금 게임을 끝낸 raidRecordId가 진행한 게임 레벨을 찾아서
       * 해당 레벨의 점수를 해당 user_id의 score에 합산하자.
       */
      levels.forEach((info) => {
        if (boss_raid_level === info.level) {
          singleScore = info.score;
          score = score + singleScore;
        }
      });

      /** 📍 유효성 검사 - 예외 처리
       * 1. 
       * 2. 레이드 제한시간 out
       */
      // 1.
      if (user_id !== userId) {
        return res.status(403).json({
          message: "아이디가 다르므로 접근 불가합니다.",
        });
      }
      // 2.
      let endTime = new Date();  
      let endTimeFormat = endTime.toFormat("YYYY-MM-DD HH:MI:SS");

      if ((endTime.getTime() - new Date(enter_time).getTime()) / 1000 > bossRaidLimitSeconds) {
        return res.status(400).json({
          message: "레이드 제한시간을 넘었으므로 기록에 남지 않습니다.",
        });
      }

      // success 여부 입력
      await BossRaidService.setSuccess(raidRecordId);

      // 게임 종료후 end_time 입력
      await BossRaidService.putEndTime(raidRecordId, endTimeFormat);

      // 유저테이블 총점 업데이트
      await BossRaidService.updateTotalScore(userId, score);

      // raidStatus 삭제
      await BossRaidService.delRedisStatus();

      // 랭킹 업데이트
      await BossRaidController.topRankerToCache();
      
    } catch (err) {
      throw err;
    }

    res.status(200).json({
      message: "게임종료",
      bossRaidEndData: {
        userId,
        raidRecordId,
        bossRaidLevel: boss_raid_level,
        totalScore: score,
        singleScore,
      },
    });
  }

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

  
}

module.exports = BossRaidController;