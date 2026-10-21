const { makeGroup } = require("../../commandGroup");
const g = (file) => require(`../game/${file}`);
const shop = g("fishing_shop");

// /낚시 — 미끼와 낚싯대를 사서 낚시하고 도감을 채운다
module.exports = makeGroup({
  name: "낚시",
  description: "낚시하고 도감을 채워요 (미끼·낚싯대 구매, 랭킹)",
  entries: [
    { name: "시작", module: g("fishing") },
    { name: "도감", module: g("fishing_dex") },
    { name: "미끼구매", module: shop.baitModule },
    { name: "낚싯대구매", module: shop.rodModule },
    { name: "랭킹", module: g("fishing_rank") },
  ],
});
