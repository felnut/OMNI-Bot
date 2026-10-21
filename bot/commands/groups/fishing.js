const { makeGroup } = require("../../commandGroup");
const g = (file) => require(`../game/${file}`);

// /낚시 — 상점에서 미끼와 낚싯대를 사서 낚시하고 도감을 채운다
module.exports = makeGroup({
  name: "낚시",
  description: "낚시하고 도감을 채워요 (상점에서 미끼·낚싯대 구매, 랭킹)",
  entries: [
    { name: "시작", module: g("fishing") },
    { name: "도감", module: g("fishing_dex") },
    { name: "상점", module: g("fishing_shop") },
    { name: "랭킹", module: g("fishing_rank") },
  ],
});
