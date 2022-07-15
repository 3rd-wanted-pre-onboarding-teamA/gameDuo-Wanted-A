const httpMocks = require("node-mocks-http");
const BossRaidController = require("../controllers/bossRaid.controller");
const BossRaidService = require("../services/bossRaid.service");

// 보스레이드 상태 조회
describe("보스레이드 상태 조회", () => {
  describe("성공 시", () => {
    let req, res, raidStatus;
    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };
      raidStatus = jest.fn();
    });
    
    it("레이드를 진행하고 있는 유저가 있을 시 canEnter: 1, 참가 중인 유저 아이디를 반환한다", async () => {
      // BossRaidService.bossRaidStatus에서 userId = 1로 반환하도록 설정 
      BossRaidService.bossRaidStatus = jest.fn().mockResolvedValue(1);
      
      raidStatus = 1;
      await BossRaidController.bossRaidStatus(req, res);
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith({
        canEnter: 1,
        enteredUserId: raidStatus
      });
    });
    it("레이드를 진행하고 있는 유저가 없을 시 canEnter: 0을 반환한다.", async () => {
      // BossRaidService.bossRaidStatus에서 userId = null로 반환하도록 설정 
      BossRaidService.bossRaidStatus = jest.fn().mockResolvedValue(null);

      raidStatus = null;
      await BossRaidController.bossRaidStatus(req, res);
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith({ canEnter: 0 });
    });
  });
});