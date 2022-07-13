const { default: axios } = require('axios');
const redis = require("redis");
const BossRaidService = require("../services/bossRaid.service.js");
const redisClient = redis.createClient();

class BossRaidController {
    // 보스레이드 게임 시작
    static async startBossRaid(req, res) {
        const { userId, level } = req.body;
        let isEntered;

        const [data] = await BossRaidService.createId(userId, level);
        const raidRecordId = data.insertId;
        // console.log(data.insertId);
        // 레이드 시작 가능 -> 중복되지 않는 raidRecordId 생성 / isEntered=true
        // if (레이드 시작 가능) { // !enteredUserId && canEnter===false
            isEntered=true;
        // } else { // encounteredUserId
            // isEntered=false;
        // }

        return res.status(201).json({
            message: "BossRaid Start!!",
            isEntered,
            raidRecordId,
        })
    }

    // 보스레이드 게임 종료
    static async stopBossRaid(req, res) {
        let singleScore; // 게임 종료 후 총점에 합산할 점수
        let bossRaidData;
        const { userId, raidRecordId } = req.body;
        const [totalScore] = await BossRaidService.findTotalScore(userId);
        let { score } = totalScore[0];
        const [data] =  await BossRaidService.findLevel(raidRecordId);
        const { user_id, boss_raid_level } = data[0];

        /**
         * 게임 레벨 별 점수 관련 static data
         * 💽 Redis에 캐싱하여 사용하기
         */

        await redisClient.connect(); // Redis Client 연결
        const value = await redisClient.get("bossRaidData"); 
        if (value) {
            console.log("from cached data");
            bossRaidData = JSON.parse(value);
        } else {
            const {data} = await axios("https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json");
            const dataJson = JSON.stringify(data);
            await redisClient.set("bossRaidData", dataJson);
            console.log("from source data");
            bossRaidData = dataJson;
        }
        const staticData = bossRaidData.bossRaids[0];
        const { bossRaidLimitSeconds, levels } = staticData;

        /** 📍 유효성 검사 - 예외 처리
         * 1. 저장된 userId !== raidRecordId (userId와 raidRecordId를 이용하여 boss_raid table에서 찾아낸 userId가 다른 경우!)
         * 2. 레이드 제한시간 out
         */
        // 1. 
        if (user_id !== userId) {
            return res.status(403).json({
                message: "아이디가 다르므로 접근 불가합니다."
            });
        }
        
        // console.log(bossRaidLimitSeconds); 180
        // if ()
        

        /* 
        * 방금 게임을 끝낸 raidRecordId가 진행한 게임 레벨을 찾아서
        * 해당 레벨의 점수를 해당 user_id의 score에 합산하자.
        */
        levels.forEach(info => {
            if (boss_raid_level === info.level) {
                singleScore = info.score;
                score = score + singleScore;
            } 
        });

        res.status(200).json({
            message: "게임종료",
            bossRaidEndData: {
                userId,
                raidRecordId,
                boss_raid_level,
                totalScore: score,
                singleScore,
            }
        });
        
    }
}

module.exports = BossRaidController;