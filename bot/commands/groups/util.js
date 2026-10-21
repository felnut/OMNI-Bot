const { makeGroup } = require("../../commandGroup");
const u = (file) => require(`../utils/${file}`);

// /유틸 — 일상에서 쓰는 도구 모음
module.exports = makeGroup({
  name: "유틸",
  description: "계산·주사위·운세·추첨·디데이·정보 확인·도움말",
  entries: [
    { name: "계산", module: u("calc") },
    { name: "주사위", module: u("dice") },
    { name: "운세", module: u("fortune") },
    { name: "추첨", module: u("pick") },
    { name: "디데이", module: u("dday") },
    { name: "서버정보", module: u("server_info") },
    { name: "유저정보", module: u("user_info") },
    { name: "핑", module: u("ping") },
    { name: "도움말", module: u("help") },
  ],
});
