const { default: axios } = require('axios');
const redis = require("redis");
const { config } = require('../config');

const startBossRaid = async (req, res) => {
    const { userId, level } = req.body;
    console.log(userId, level);

    let isEntered;
    let raidRecordId;

    // 레이드 시작 가능 -> 중복되지 않는 raidRecordId 생성 / isEntered=true
    // if (레이드 시작 가능) { // !enteredUserId && canEnter===false
        raidRecordId = 1;
        isEntered=true;
    // } else { // encounteredUserId
        isEntered=false;
    // }

    return res.status(201).json({
        isEntered,
        raidRecordId,
    })
}

// https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json
const redisClient = redis.createClient(config.redisInfo.port);

const stopBossRaid = async (req, res) => {
    const { userId, raidRecordId } = req.body;
    await redisClient.connect();
    const value = await redisClient.get("bossRaidData");
    if (value) {
        console.log("from cached data");
        res.json(JSON.parse(value));
    } else {
        const {data} = await axios("https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json");
        const dataJson = JSON.stringify(data);
        await redisClient.set("bossRaidData", dataJson);
        console.log("from source data");
        res.
    }

    // try {
    //     const {data} = await axios.get("");
    //     // console.log(JSON.stringify(data))
    //     const dataJson = JSON.stringify(data);
    //     redisClient.set("bossRaidData", dataJson);
    // } catch (err) {
    //     console.error(err);
    //     res.status(400).send(err);
    // }


    // 유효성 검사 - 예외 처리
        // 저장된 userId !== raidRecordId

        // 레이드 제한시간 out
}

module.exports = {
    startBossRaid,
    stopBossRaid,
}