const { default: axios } = require("axios");
const redis = require("redis");
const BossRaidService = require("../services/bossRaid.service.js");
const redisClient = redis.createClient();

class BossRaidController {
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
      await redisClient.connect();
      const value = await redisClient.get("raidStatus");
      if (value) {
        // 게임 시작 불가능
        isEntered = true;
        return res.status(400).json({
          message: "이미 게임중인 사용자가 있습니다.",
          isEntered,
        });
      } else {
        // 게임 시작 가능
        await redisClient.set("raidStatus", raidRecordId);
        isEntered = true;
      }
    } catch (err) {
      throw err;
    } finally {
      await redisClient.disconnect();
    }

    return res.status(201).json({
      message: "BossRaid Start!!",
      isEntered,
      raidRecordId,
    });
  }

  // 보스레이드 게임 종료
  static async stopBossRaid(req, res) {
    let singleScore; // 게임 종료 후 총점에 합산할 점수
    let bossRaidData;
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
      await redisClient.connect(async (conn) => conn);
      const value = await redisClient.get("bossRaidData");
      if (value) {
        console.log("from cached data");
      } else {
        const { data } = await axios("https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json");
        const dataJson = JSON.stringify(data);
        await redisClient.set("bossRaidData", dataJson);
        console.log("from source data");
      }
      bossRaidData = JSON.parse(value);
      const staticData = bossRaidData.bossRaids[0];
      const { bossRaidLimitSeconds, levels } = staticData;

      /** 📍 유효성 검사 - 예외 처리
       * 1. 저장된 userId !== raidRecordId (userId와 raidRecordId를 이용하여 boss_raid table에서 찾아낸 userId가 다른 경우!)
       * 2. 레이드 제한시간 out
       */
      // 1.
      if (user_id !== userId) {
        return res.status(403).json({
          message: "아이디가 다르므로 접근 불가합니다.",
        });
      }
      // 2.
      let enter_time2 = enter_time.split(" ");
      let end_time = new Date();
      let enter_time3 = new Date(enter_time2[0] + " " + enter_time2[1]);

      const date = new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];
      const time = new Date().toTimeString().split(" ")[0];
      const end_time_date = `${date} ${time}`;

      // console.log(date + ' ' + time);

      if ((end_time.getTime() - enter_time3.getTime()) / 1000 > bossRaidLimitSeconds) {
        return res.status(400).json({
          message: "레이드 제한시간을 넘었으므로 기록에 남지 않습니다.",
        });
      }

      // 게임 종료후 end_time 입력
      await BossRaidService.putEndTime(raidRecordId, end_time_date);

      // redisStatus 삭제
      await redisClient.del("raidStatus");

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
    } finally {
      await redisClient.disconnect();
    }

    res.status(200).json({
      message: "게임종료",
      bossRaidEndData: {
        userId,
        raidRecordId,
        boss_raid_level,
        totalScore: score,
        singleScore,
      },
    });
  }
}

module.exports = BossRaidController;
