const BossRaidService = require("../services/bossRaid.service");

class BossRaidController {
  static bossRaidStatus = async function (req, res) {
    let raidStatus = await BossRaidService.bossRaidStatus();
    if (!raidStatus) {
      return res.status(200).json({canEnter: 0});
    } else {
      return res.status(200).json({
        canEnter: 1,
        enteredUserId: raidStatus
      });
    }
  };
}

module.exports = BossRaidController;