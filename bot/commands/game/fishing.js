const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const db = require("../../../Database");
const cache = require("../utils/cache");
const progress = require("../../managers/progress");
const { pickWeighted } = require("../../managers/instantGame");
const { tableFor, RODS, BAITS, BAIT_BY_KEY } = require("../../managers/fishData");

const stmtUser = db.prepare("SELECT money FROM user WHERE user_id = ?");
const stmtRod = db.prepare("SELECT rod FROM fishing_gear WHERE user_id = ?");
const stmtBait = db.prepare("SELECT qty FROM fishing_bait WHERE user_id = ? AND kind = ?");
const stmtUseBait = db.prepare("UPDATE fishing_bait SET qty = qty - 1 WHERE user_id = ? AND kind = ? AND qty > 0");
const stmtMoney = db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?");
const stmtLog = db.prepare(
  "INSERT INTO fish_log (user_id, fish, count) VALUES (?, ?, 1) ON CONFLICT(user_id, fish) DO UPDATE SET count = count + 1",
);

/** 미끼 1개를 쓰고 던진다. 결과(물고기)를 정하고 판매가를 바로 지급 */
const cast = db.transaction((userId, baitKey) => {
  if (!stmtUser.get(userId)) return { error: "NOT_REGISTERED" };
  const bait = BAIT_BY_KEY.get(baitKey);
  if (!stmtUseBait.run(userId, baitKey).changes) return { error: "NO_BAIT", bait };
  const rod = stmtRod.get(userId)?.rod ?? 0;
  const fish = pickWeighted(tableFor(rod));
  const price = Math.floor(bait.price * fish.mult);
  stmtMoney.run(price, userId);
  stmtLog.run(userId, fish.key);
  return { fish, bait, price, rod, left: stmtBait.get(userId, baitKey)?.qty ?? 0, balance: stmtUser.get(userId).money };
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("낚시")
    .setDescription("미끼를 써서 낚시해요! 잡은 물고기는 바로 팔려요")
    .addStringOption((o) =>
      o
        .setName("미끼")
        .setDescription("쓸 미끼 (기본: 일반 미끼)")
        .addChoices(...BAITS.map((b) => ({ name: `${b.name} (${b.price.toLocaleString()}원짜리)`, value: b.key }))),
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const r = cast(userId, interaction.options.getString("미끼") ?? "basic");
    if (r.error === "NOT_REGISTERED") return interaction.reply({ content: "먼저 `/게임 가입`으로 가입해주세요!", flags: MessageFlags.Ephemeral });
    if (r.error) {
      return interaction.reply({ content: `🪱 ${r.bait.name}가 없어요. \`/낚시 미끼구매\`로 먼저 사 주세요!`, flags: MessageFlags.Ephemeral });
    }
    cache.invalidateMoney(userId);
    progress.record(userId, "fish");

    const net = r.price - r.bait.price;
    const embed = new EmbedBuilder()
      .setColor(net > 0 ? 0x57f287 : net < 0 ? 0xed4245 : 0xfee75c)
      .setTitle(net > 0 ? "🎣 월척이에요!" : "🎣 낚시 결과")
      .setDescription(
        `낚싯줄을 당겼더니... **${r.fish.name}**!\n판매가 **${r.price.toLocaleString()}원** (${r.fish.mult}배)\n\n` +
          `💵 수익 **${net > 0 ? "+" : ""}${net.toLocaleString()}원** (미끼값 ${r.bait.price.toLocaleString()}원)\n` +
          `🪱 남은 ${r.bait.name} **${r.left.toLocaleString()}개** · 🎣 ${RODS[r.rod].name}\n💰 현재 잔액 **${r.balance.toLocaleString()}원**`,
      )
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  },
};
