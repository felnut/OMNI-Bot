const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const db = require("../../../Database");
const cache = require("../utils/cache");
const progress = require("../../managers/progress");

// 무기 강화: 돈을 쓰는 곳. 단계별 [강화비, 성공 확률, 실패 시 한 단계 하락 여부]와 판매가.
// 판매가는 "강화 한 단계의 기대 환수율이 94%"가 되도록 역산한 값이다. 어느 단계에서 멈춰도 기대 손익은 마이너스다.
const CREATE_COST = 1000;
const STEPS = [
  [200, 0.9, false], [300, 0.85, false], [500, 0.8, false], [800, 0.72, false], [1200, 0.65, false],
  [2000, 0.55, true], [3000, 0.5, true], [4500, 0.45, true], [7000, 0.4, true], [10000, 0.35, true],
];
const SELL_PRICE = [700, 880, 1170, 1710, 2680, 4280, 8760, 18190, 37290, 77850, 168400];
const NAMES = ["나무 막대", "녹슨 검", "철검", "강철검", "미스릴 검", "다마스커스 검", "룬 검", "용린 검", "성검", "마검", "신검"];
const MAX_LEVEL = STEPS.length;

const label = (level) => `+${level} ${NAMES[level]}`;
const won = (n) => `${n.toLocaleString()}원`;

const stmtUser = db.prepare("SELECT money FROM user WHERE user_id = ?");
const stmtWeapon = db.prepare("SELECT level, best_level FROM weapon WHERE user_id = ?");
const stmtMoney = db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?");

const notRegistered = (i) => i.reply({ content: "먼저 `/돈`으로 가입해주세요!", flags: MessageFlags.Ephemeral });
const noWeapon = (i) => i.reply({ content: "무기가 없어요. `/무기 생성`으로 먼저 만들어 보세요!", flags: MessageFlags.Ephemeral });
const lackMoney = (i, need) => i.reply({ content: `💸 돈이 부족해요! (필요: ${won(need)})`, flags: MessageFlags.Ephemeral });

const create = db.transaction((userId) => {
  const user = stmtUser.get(userId);
  if (!user) return { error: "NOT_REGISTERED" };
  if (stmtWeapon.get(userId)) return { error: "HAS_WEAPON" };
  if (user.money < CREATE_COST) return { error: "INSUFFICIENT_MONEY" };
  stmtMoney.run(-CREATE_COST, userId);
  db.prepare("INSERT INTO weapon (user_id, level, best_level, updated_at) VALUES (?, 0, 0, ?)").run(userId, Date.now());
  return { balance: user.money - CREATE_COST };
});

const enhance = db.transaction((userId) => {
  const user = stmtUser.get(userId);
  if (!user) return { error: "NOT_REGISTERED" };
  const weapon = stmtWeapon.get(userId);
  if (!weapon) return { error: "NO_WEAPON" };
  if (weapon.level >= MAX_LEVEL) return { error: "MAX_LEVEL" };
  const [cost, chance, dropOnFail] = STEPS[weapon.level];
  if (user.money < cost) return { error: "INSUFFICIENT_MONEY", need: cost };
  stmtMoney.run(-cost, userId);
  const success = Math.random() < chance;
  const level = success ? weapon.level + 1 : dropOnFail ? weapon.level - 1 : weapon.level;
  db.prepare("UPDATE weapon SET level = ?, best_level = MAX(best_level, ?), updated_at = ? WHERE user_id = ?").run(level, level, Date.now(), userId);
  return { success, from: weapon.level, level, cost, chance, balance: user.money - cost };
});

const sell = db.transaction((userId) => {
  const user = stmtUser.get(userId);
  if (!user) return { error: "NOT_REGISTERED" };
  const weapon = stmtWeapon.get(userId);
  if (!weapon) return { error: "NO_WEAPON" };
  const price = SELL_PRICE[weapon.level];
  stmtMoney.run(price, userId);
  db.prepare("DELETE FROM weapon WHERE user_id = ?").run(userId);
  return { level: weapon.level, price, balance: user.money + price };
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("무기")
    .setDescription("무기를 만들고 강화해요 (최대 +10, 강화비는 돈으로 내요)")
    .addSubcommand((s) => s.setName("생성").setDescription(`무기를 만들어요 (${won(CREATE_COST)})`))
    .addSubcommand((s) => s.setName("강화").setDescription("내 무기를 한 단계 강화해요 (실패하면 단계가 내려갈 수 있어요)"))
    .addSubcommand((s) => s.setName("정보").setDescription("내 무기와 다음 강화 정보를 확인해요"))
    .addSubcommand((s) => s.setName("판매").setDescription("내 무기를 팔아요"))
    .addSubcommand((s) => s.setName("랭킹").setDescription("현재 무기 단계 순위 TOP 10")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (sub === "생성") {
      const r = create(userId);
      if (r.error === "NOT_REGISTERED") return notRegistered(interaction);
      if (r.error === "HAS_WEAPON") return interaction.reply({ content: "이미 무기가 있어요! 판매한 뒤 새로 만들 수 있어요.", flags: MessageFlags.Ephemeral });
      if (r.error) return lackMoney(interaction, CREATE_COST);
      cache.invalidateMoney(userId);
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("🔨 무기를 만들었어요!")
        .setDescription(`**${label(0)}**을 손에 넣었어요.\n\`/무기 강화\`로 강화해 보세요.\n\n💰 현재 잔액 **${won(r.balance)}**`);
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "강화") {
      const r = enhance(userId);
      if (r.error === "NOT_REGISTERED") return notRegistered(interaction);
      if (r.error === "NO_WEAPON") return noWeapon(interaction);
      if (r.error === "MAX_LEVEL") return interaction.reply({ content: `이미 최고 단계(${label(MAX_LEVEL)})예요! 판매해서 새로 도전해 보세요.`, flags: MessageFlags.Ephemeral });
      if (r.error) return lackMoney(interaction, r.need);
      cache.invalidateMoney(userId);
      progress.record(userId, "weapon");
      progress.recordMax(userId, "weapon_best", r.level);
      const embed = new EmbedBuilder()
        .setColor(r.success ? 0x57f287 : 0xed4245)
        .setTitle(r.success ? "✨ 강화 성공!" : r.level < r.from ? "💥 강화 실패… 단계가 내려갔어요" : "💨 강화 실패")
        .setDescription(
          `${label(r.from)} → **${label(r.level)}**\n` +
            `강화비 ${won(r.cost)} (성공 확률 ${Math.round(r.chance * 100)}%)\n\n💰 현재 잔액 **${won(r.balance)}**`,
        );
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "정보") {
      if (!stmtUser.get(userId)) return notRegistered(interaction);
      const w = stmtWeapon.get(userId);
      if (!w) return noWeapon(interaction);
      const next = STEPS[w.level];
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`⚔️ ${interaction.user.username}님의 무기`)
        .setDescription(`**${label(w.level)}**`)
        .addFields(
          { name: "판매가", value: won(SELL_PRICE[w.level]), inline: true },
          { name: "최고 기록", value: `+${w.best_level}`, inline: true },
          {
            name: "다음 강화",
            value: next
              ? `강화비 ${won(next[0])} · 성공 ${Math.round(next[1] * 100)}%${next[2] ? "\n실패하면 한 단계 내려가요" : ""}`
              : "최고 단계예요!",
            inline: false,
          },
        );
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "판매") {
      const r = sell(userId);
      if (r.error === "NOT_REGISTERED") return notRegistered(interaction);
      if (r.error) return noWeapon(interaction);
      cache.invalidateMoney(userId);
      const embed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle("💰 무기를 팔았어요")
        .setDescription(`**${label(r.level)}** → **${won(r.price)}**\n\n💰 현재 잔액 **${won(r.balance)}**`);
      return interaction.reply({ embeds: [embed] });
    }

    // 랭킹
    const rows = db.prepare("SELECT user_id, level, best_level FROM weapon ORDER BY level DESC, best_level DESC, updated_at ASC LIMIT 10").all();
    const medals = ["🥇", "🥈", "🥉"];
    const text = rows.length
      ? rows.map((r, i) => `${medals[i] ?? `${i + 1}.`} <@${r.user_id}> **${label(r.level)}** (최고 +${r.best_level})`).join("\n")
      : "아직 무기를 가진 분이 없어요. `/무기 생성`으로 첫 번째가 되어 보세요!";
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffd700).setTitle("🏆 무기 랭킹 TOP 10").setDescription(text)], allowedMentions: { parse: [] } });
  },
};
