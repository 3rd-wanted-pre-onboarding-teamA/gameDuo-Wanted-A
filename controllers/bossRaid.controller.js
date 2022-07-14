const BossRaidService = require("../services/bossRaid.service");
const { default: axios } = require("axios");
require("date-utils");

class BossRaidController {
  // 보스레이드 게임 시작
  static startBossRaid = async function(req, res) {
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

  // 보스레이드 게임 종료
  static stopBossRaid = async function (req, res) {
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

      // redisStatus 삭제
      await BossRaidService.delRedisStatus();

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
}

module.exports = BossRaidController;