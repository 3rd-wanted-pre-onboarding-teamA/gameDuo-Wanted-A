const BossRaidService = require("../services/bossRaid.service");
const RankingInfo = require("../models/rankingInfo.model");
require("date-utils");
const response = require("../utils/response");

class BossRaidController {
  static async bossRaidStatus(req, res) {
    /**
     * 기능: 상태 조회
     * 작성자: 장덕수
     */
    try {
      let raidStatus = await BossRaidService.bossRaidStatus();
      if (!raidStatus) {
        return res.status(200).json({ canEnter: 0 });
      } else {
        return res.status(200).json({
          canEnter: 1,
          enteredUserId: raidStatus,
        });
      }
    } catch (err) {
      throw err;
    }
  };

  static async startBossRaid(req, res) {
    /**
     * 기능: 보스레이드 게임 시작
     * 작성자: 이승연
     */
    const { userId, level } = req.body;
    const [data] = await BossRaidService.createId(userId, level); // raidRecordId 생성
    const raidRecordId = data.insertId;
    let isEntered = false;

    try { // Redis에서 raidStatus가 있으면 이미 사용중이므로 게임 시작이 불가능하고 반대의 경우 게임 시작이 가능하다
      let raidStatus = await BossRaidService.bossRaidStatus();
      if (raidStatus) { // 게임 시작 불가능
        isEntered = true;
        return res.status(400).json({
          message: response.USING_GAME,
          isEntered,
        });
      } else { // 게임 시작 가능
        await BossRaidService.putRaidRecordId(raidRecordId);
        isEntered = true;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }

    return res.status(201).json({
      message: response.GAME_START,
      isEntered,
      raidRecordId,
    });
  }

  static async stopBossRaid(req, res) {
    /**
     * 기능: 보스레이드 게임 종료
     * 작성자: 이승연
     */
    let singleScore; // 게임 종료 후 총점에 합산할 점수
    const { userId, raidRecordId } = req.body;
    const [totalScore] = await BossRaidService.findTotalScore(userId);
    let { score } = totalScore[0];
    const [data] = await BossRaidService.findLevel(raidRecordId);
    const { user_id, boss_raid_level, enter_time } = data[0];

    try { // 게임 레벨 별 점수 관련 static data 💽 Redis에 캐싱하여 사용하기
      let value = await BossRaidService.levelCahceToRedis();
      let bossRaidLimitSeconds, levels;
      if (value) {
        console.log(response.STATIC_DATA_CACHE);
        bossRaidLimitSeconds = JSON.parse(value).bossRaids[0].bossRaidLimitSeconds;
        levels = JSON.parse(value).bossRaids[0].levels;
      } else {
        console.log(response.STATIC_DATA_SOURCE);
        const { data } = await axios.get("https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json");
        await BossRaidService.putStaticData(JSON.stringify(data));
        bossRaidLimitSeconds = data.bossRaids[0].bossRaidLimitSeconds;
        levels = data.bossRaids[0].levels;
      }

      levels.forEach((info) => { // 방금 게임을 끝낸 raidRecordId가 진행한 게임 레벨을 찾아서 해당 레벨의 점수를 해당 user_id의 score에 합산
        if (boss_raid_level === info.level) {
          singleScore = info.score;
          score = score + singleScore;
        }
      });

      // 1. 유효성 검사 - 예외 처리 (user)
      if (user_id !== userId) {
        return res.status(403).json({
          message: response.DIFF_USERID
        });
      }
      // 2. 유효성 검사 - 예외 처리 (레이드 제한시간 초과)
      let endTime = new Date();
      let endTimeFormat = endTime.toFormat("YYYY-MM-DD HH:MI:SS");

      if ((endTime.getTime() - new Date(enter_time).getTime()) / 1000 > bossRaidLimitSeconds) {
        return res.status(400).json({
          message: response.TIMEOUT,
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
      message: response.GAME_END,
      bossRaidEndData: {
        userId,
        raidRecordId,
        bossRaidLevel: boss_raid_level,
        totalScore: score,
        singleScore,
      },
    });
  }

  static async topRankerList(req, res) {
    /**
     * 기능: 랭킹 조회
     * 작성자: 허정연
     */
    const { userId } = req.body;
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
        myRankingInfo: myRankingInfoData[0],
      });
    } catch (err) {
      res.status(500).send(response.INTERNAL_SERVER_ERROR);
    }
  };

  static async topRankerToCache(req, res) {
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
      res.status(500).json(response.INTERNAL_SERVER_ERROR);
    }
  };
}

module.exports = BossRaidController;