const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const db = require("../../../Database");
const { getUserOrFail } = require("../utils/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("출석")
    .setDescription("출석하고 돈 받자! (매일 밤 12시 갱신)"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;

    // 한국 시간으로 오늘 00:00 계산
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayStart = new Date(kstNow);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayResetTimeSec = Math.floor(todayStart.getTime() / 1000);

    let user;
    try {
      user = getUserOrFail(interaction, 0); // 가입 + 잔액 체크
    } catch (err) {
      if (err.message === "NOT_REGISTERED") {
        return interaction.editReply({
          content:
            "아직 돈 시스템에 가입 안 했어.\n먼저 `/돈` 쳐서 지갑 만들어!",
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }

    // 이미 오늘 출석했는지 확인
    if (user.daily_last_reset === todayResetTimeSec) {
      const nextResetMs = (todayResetTimeSec + 86400) * 1000;
      const diffMs = nextResetMs - kstNow.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return interaction.editReply({
        content: `오늘 이미 출석했어\n다음 출석: **${hours}시간 ${minutes}분** 후`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 연속 출석 계산 & 보상 지급
    let newStreak = 1;
    const yesterdayResetTimeSec = todayResetTimeSec - 86400;
    if (user.daily_last_reset === yesterdayResetTimeSec) {
      newStreak = (user.streak || 0) + 1;
    }

    const baseReward = Math.floor(Math.random() * 201) + 150;
    const multiplier = Math.floor(newStreak / 10);
    const streakBonus = Math.round(baseReward * 0.3 * multiplier);
    const totalReward = baseReward + streakBonus;

    const newMoney = user.money + totalReward;
    db.prepare(
      `UPDATE user SET money = ?, daily_last_reset = ?, streak = ? WHERE user_id = ?`,
    ).run(newMoney, todayResetTimeSec, newStreak, userId);

    const embed = new EmbedBuilder()
      .setColor(multiplier > 0 ? 0xffaa00 : 0xf1c40f)
      .setTitle(`출석 완료! Day ${newStreak} 🔥`)
      .setDescription(
        `**${kstNow.toLocaleDateString("ko-KR")}** 출석 인정!\n\n` +
          `기본 보상: **${baseReward.toLocaleString()} 원**\n` +
          `연속 보너스: **${streakBonus.toLocaleString()} 원**\n\n` +
          `총 **${totalReward.toLocaleString()} 원** 받았어!`,
      )
      .addFields(
        {
          name: "현재 잔고",
          value: `${newMoney.toLocaleString()} 원`,
          inline: true,
        },
        { name: "연속 출석", value: `${newStreak}일째!`, inline: true },
      )
      .setFooter({ text: `매일 밤 12시에 초기화됩니다.` });

    await interaction.editReply({ embeds: [embed] });
  },
};
