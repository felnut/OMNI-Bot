const { SlashCommandBuilder } = require("discord.js");
const { MIN_BET, PROGRESS_MIN_BET, pickWeighted, play } = require("../../managers/instantGame");
const progress = require("../../managers/progress");

// 잡힌 물고기의 값어치(배율). 기대값 약 94.3%
const FISH = [
  { name: "👢 낡은 장화", weight: 250_000, mult: 0 },
  { name: "🐟 붕어", weight: 300_000, mult: 0.4 },
  { name: "🐠 잉어", weight: 220_000, mult: 0.9 },
  { name: "🐡 농어", weight: 140_000, mult: 1.5 },
  { name: "🍣 연어", weight: 65_000, mult: 3 },
  { name: "🦈 참치", weight: 20_000, mult: 6 },
  { name: "👑 황금물고기", weight: 5_000, mult: 20 },
];

const db = require("../../../Database");
const stmtLog = db.prepare(
  "INSERT INTO fish_log (user_id, fish, count) VALUES (?, ?, 1) ON CONFLICT(user_id, fish) DO UPDATE SET count = count + 1",
);

module.exports = {
  FISH,
  data: new SlashCommandBuilder()
    .setName("낚시")
    .setDescription("미끼 값을 내고 낚시해요! 잡은 물고기는 바로 팔려요 (황금물고기는 20배)")
    .addIntegerOption((o) => o.setName("미끼").setDescription("미끼에 쓸 금액").setRequired(true).setMinValue(MIN_BET)),

  async execute(interaction) {
    const bet = interaction.options.getInteger("미끼");
    return play(
      interaction,
      bet,
      () => pickWeighted(FISH),
      (fish, { net }) => {
        // 정산이 끝난 판만 기록된다 (render는 정산 후에 호출됨). 도감도 도전과제 보상이 걸려 있어 퀘스트와 같은 최소 미끼 기준을 쓴다
        if (bet >= PROGRESS_MIN_BET) {
          stmtLog.run(interaction.user.id, fish.name);
          progress.record(interaction.user.id, "fish");
        }
        return {
        title: net > 0 ? "🎣 월척이에요!" : "🎣 낚시 결과",
        description: `낚싯줄을 당겼더니... **${fish.name}**!\n판매가 **${Math.floor(bet * fish.mult).toLocaleString()}원** (${fish.mult}배)`,
        };
      },
    );
  },
};
