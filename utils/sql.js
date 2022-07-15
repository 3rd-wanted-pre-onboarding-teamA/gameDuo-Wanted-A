module.exports = {
    SELECT_USER_ID: "SELECT user_id FROM boss_raid WHERE raid_record_id=?",
    INSERT_BOSS_RAID: "INSERT INTO boss_raid (user_id, boss_raid_level) VALUES (?)",
    SELECT_ALL_BOSS_RAID: "SELECT user_id, boss_raid_level, enter_time, end_time FROM boss_raid WHERE raid_record_id=?",
    SELECT_ALL_USER: "SELECT * FROM user WHERE user_id=?",
    SELECT_RECORD_ID: "SELECT raid_record_id FROM boss_raid ORDER BY raid_record_id DESC limit 1",
    UPDATE_BOSS_RAID: "UPDATE boss_raid SET end_time=?, success=true WHERE raid_record_id=",
    UPDATE_TOTAL_SCORE: "UPDATE user SET score=? WHERE user_id=",
    SELECT_MY_RANKING: "SELECT * FROM (SELECT row_number() OVER(ORDER BY score DESC) AS ranking, user_id AS 'userId', score AS 'totalScore' FROM user)r WHERE userId=?",
    SELECT_TOP10_RANKING: "select * from user order by score desc limit 10"
}

