module.exports = {
  BAD_REQUEST: { status: 400, message: "Bad Request", detail: "잘못된 요청입니다." },
  FORBIDDEN: { status: 403, message: "Forbidden", detail: "권한이 없는 사용자입니다." },
  NOT_FOUND: { status: 404, message: "Not Found", detail: "올바른 경로로 접속하세요." },
  INTERNAL_SERVER_ERROR: { status: 500, message: "Internal Server Error", detail: "서버 에러입니다. 관리자에게 문의하세요." },
  USING_GAME: "이미 게임중인 사용자가 있습니다.",
  STATIC_DATA_CACHE: "캐시에서 점수데이터를 가져옵니다.", 
  STATIC_DATA_SOURCE: "원격에서 점수데이터를 가져옵니다.", 
  DIFF_USERID: "아이디가 다르므로 접근 불가합니다.",
  TIMEOUT: "레이드 제한시간을 넘었으므로 기록에 남지 않습니다.", 
  GAME_START: "게임이 시작되었습니다.",
  GAME_END: "게임이 종료되었습니다.",
  RANKING_RESET: "랭킹이 재설정되었습니다.",
};