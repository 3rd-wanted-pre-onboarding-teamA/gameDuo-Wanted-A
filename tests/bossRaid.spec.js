const httpMocks = require("node-mocks-http");
const BossRaidController = require("../controllers/bossRaid.controller");

describe("보스레이드 랭킹 조회", () => {
  let req, res;
  beforeEach(() => {
    req = httpMocks.createRequest({
      body: {
        userId: 1
      },
    });
    res = httpMocks.createResponse();
  });

  it("보스레이드 랭킹 조회 성공 시 200 반환한다.", async () => {
    await BossRaidController.topRankerList(req, res);
    expect(res.statusCode).toBe(200);
  });
});