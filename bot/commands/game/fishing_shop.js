// 낚시 도구 상점: /낚시 미끼구매, /낚시 낚싯대구매 (묶음 파일 bot/commands/groups/fishing.js에서 하위 명령으로 쓴다)
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const db = require("../../../Database");
const cache = require("../utils/cache");
const { RODS, BAITS, BAIT_BY_KEY, MAX_BAIT_PER_KIND, FISH } = require("../../managers/fishData");

const stmtUser = db.prepare("SELECT money FROM user WHERE user_id = ?");
const stmtMoney = db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?");
const stmtBait = db.prepare("SELECT qty FROM fishing_bait WHERE user_id = ? AND kind = ?");
const stmtAddBait = db.prepare(
  "INSERT INTO fishing_bait (user_id, kind, qty) VALUES (?, ?, ?) ON CONFLICT(user_id, kind) DO UPDATE SET qty = qty + excluded.qty",
);
const stmtRod = db.prepare("SELECT rod FROM fishing_gear WHERE user_id = ?");
const stmtSetRod = db.prepare("INSERT INTO fishing_gear (user_id, rod) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET rod = excluded.rod");

const buyBait = db.transaction((userId, kind, qty) => {
  const user = stmtUser.get(userId);
  if (!user) return { error: "NOT_REGISTERED" };
  const bait = BAIT_BY_KEY.get(kind);
  const have = stmtBait.get(userId, kind)?.qty ?? 0;
  if (have + qty > MAX_BAIT_PER_KIND) return { error: "TOO_MANY", have };
  const cost = bait.price * qty;
  if (user.money < cost) return { error: "INSUFFICIENT_MONEY", cost };
  stmtMoney.run(-cost, userId);
  stmtAddBait.run(userId, kind, qty);
  return { bait, cost, have: have + qty, balance: user.money - cost };
});

const buyRod = db.transaction((userId, level) => {
  const user = stmtUser.get(userId);
  if (!user) return { error: "NOT_REGISTERED" };
  const current = stmtRod.get(userId)?.rod ?? 0;
  if (level <= current) return { error: "ALREADY", current };
  const cost = RODS[level].price;
  if (user.money < cost) return { error: "INSUFFICIENT_MONEY", cost };
  stmtMoney.run(-cost, userId);
  stmtSetRod.run(userId, level);
  return { cost, balance: user.money - cost };
});

const reply = (i, content) => i.reply({ content, flags: MessageFlags.Ephemeral });
const NOT_REGISTERED = "먼저 `/게임 가입`으로 가입해주세요!";

const baitModule = {
  data: new SlashCommandBuilder()
    .setName("미끼구매")
    .setDescription("낚시에 쓸 미끼를 사요")
    .addStringOption((o) =>
      o
        .setName("종류")
        .setDescription("미끼 종류 (비쌀수록 한 번에 걸리는 판돈이 커요)")
        .setRequired(true)
        .addChoices(...BAITS.map((b) => ({ name: `${b.name} (${b.price.toLocaleString()}원)`, value: b.key }))),
    )
    .addIntegerOption((o) => o.setName("수량").setDescription(`살 개수 (1~100, 한 종류당 ${MAX_BAIT_PER_KIND}개까지 보관)`).setRequired(true).setMinValue(1).setMaxValue(100)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const r = buyBait(userId, interaction.options.getString("종류"), interaction.options.getInteger("수량"));
    if (r.error === "NOT_REGISTERED") return reply(interaction, NOT_REGISTERED);
    if (r.error === "TOO_MANY") return reply(interaction, `미끼는 한 종류당 ${MAX_BAIT_PER_KIND}개까지만 가질 수 있어요. (지금 ${r.have}개)`);
    if (r.error) return reply(interaction, `💸 돈이 부족해요! (필요: ${r.cost.toLocaleString()}원)`);
    cache.invalidateMoney(userId);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("🪱 미끼를 샀어요")
      .setDescription(`${r.bait.name} → 지금 **${r.have.toLocaleString()}개**\n쓴 돈 ${r.cost.toLocaleString()}원\n\n💰 현재 잔액 **${r.balance.toLocaleString()}원**`);
    return interaction.reply({ embeds: [embed] });
  },
};

const rodModule = {
  data: new SlashCommandBuilder()
    .setName("낚싯대구매")
    .setDescription("더 좋은 낚싯대를 사요 (새 물고기가 나타나요)")
    .addIntegerOption((o) =>
      o
        .setName("단계")
        .setDescription("사려는 낚싯대")
        .setRequired(true)
        .addChoices(...RODS.slice(1).map((r, i) => ({ name: `${r.name} (${r.price.toLocaleString()}원)`, value: i + 1 }))),
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const level = interaction.options.getInteger("단계");
    const r = buyRod(userId, level);
    if (r.error === "NOT_REGISTERED") return reply(interaction, NOT_REGISTERED);
    if (r.error === "ALREADY") return reply(interaction, `이미 ${RODS[r.current].name} 이상을 가지고 있어요.`);
    if (r.error) return reply(interaction, `💸 돈이 부족해요! (필요: ${r.cost.toLocaleString()}원)`);
    cache.invalidateMoney(userId);
    const unlocked = FISH.filter((f) => f.rod === level).map((f) => f.name).join(", ");
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🎣 ${RODS[level].name}를 샀어요!`)
      .setDescription(`새로 나타나는 물고기: **${unlocked}**\n쓴 돈 ${r.cost.toLocaleString()}원\n\n💰 현재 잔액 **${r.balance.toLocaleString()}원**`);
    return interaction.reply({ embeds: [embed] });
  },
};

// 이 파일은 두 개의 하위 명령을 한꺼번에 내보낸다 (묶음 파일이 각각 꺼내 쓴다)
module.exports = { baitModule, rodModule };
