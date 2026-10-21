const { makeGroup } = require("../../commandGroup");

// /운영 — 봇 운영자 전용 (서버 관리자에게만 보이고, 실행은 각 명령어가 봇 운영자인지 다시 확인한다)
module.exports = makeGroup({
  name: "운영",
  description: "[봇 운영자 전용] 돈 설정, 주가 갱신",
  adminOnly: true,
  entries: [
    { name: "돈설정", module: require("../admin/setmoney") },
    { name: "시세갱신", module: require("../admin/tick") },
  ],
});
