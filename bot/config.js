// 기능 스위치 (.env로 켜고 끈다. 기본값은 모두 꺼짐)
// index.js·deploy-commands.js가 dotenv를 먼저 읽은 뒤에 불러와야 한다
module.exports = {
  // 서버별 이용 기록(user_guild) 저장과 '현재 서버' 랭킹.
  // 개인정보 처리방침 개정본(2026-10-26 시행)에 이 항목이 반영되기 전까지는 꺼 둔다. 켜려면 GUILD_RANK_ENABLED=1
  GUILD_RANK_ENABLED: process.env.GUILD_RANK_ENABLED === "1",
};
