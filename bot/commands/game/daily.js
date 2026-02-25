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
    .setDescription("출석하고 돈 받자! (매일 오전 9시 갱신)"),

  async execute(interaction) {
    const userId = interaction.user.id;

    // 서울 시간 현재 시점
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
    const nowDate = new Date(now);

    // 오늘 오전 9시
    let today9am = new Date(nowDate);
    today9am.setHours(9, 0, 0, 0);

    // 출석일
    let attendanceDay;
    if (nowDate < today9am) {
      attendanceDay = new Date(today9am);
      attendanceDay.setDate(attendanceDay.getDate() - 1);
    } else {
      attendanceDay = today9am;
    }

    // 초 단위로 변환
    const attendanceResetTime = Math.floor(attendanceDay.getTime() / 1000);

    // 유저 정보
    const user = getUserOrFail(interaction, 0);
    if (!user) return;

    // 이미 이 출석일(9시 기준 날짜)에 출석했는지
    if (user.daily_last_reset === attendanceResetTime) {
      const next9am = new Date(attendanceResetTime + 24 * 60 * 60 * 1000);
      const diffMs = next9am - nowDate;
      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

      return interaction.reply({
        content: `오늘 이미 출석했어\n다음 출석: **${hours}시간 ${minutes}분** 후`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 연속 출석 판단 (이전 출석이 바로 직전 날짜의 9시였는지)
    let newStreak = 1;
    const prevDayReset = attendanceResetTime - 24 * 60 * 60 * 1000;

    if (user.daily_last_reset === prevDayReset) {
      newStreak = (user.streak || 0) + 1;
    } else {
      newStreak = 1;
    }

    // 기본 보상
    const baseReward = Math.floor(Math.random() * 201) + 150;

    // 보너스: 기본 × 0.3 × floor(연속 / 10)
    const multiplier = Math.floor(newStreak / 10);
    const streakBonus = Math.round(baseReward * 0.3 * multiplier);

    const totalReward = baseReward + streakBonus;

    // DB 업데이트 (daily_last_reset = 이 출석의 9시 타임스탬프)
    const newMoney = user.money + totalReward;
    db.prepare(
      `UPDATE user SET money = ?, daily_last_reset = ?, streak = ? WHERE user_id = ?`,
    ).run(newMoney, attendanceResetTime, newStreak, userId);

    // 임베드
    const embed = new EmbedBuilder()
      .setColor(multiplier > 0 ? 0xffaa00 : 0xf1c40f)
      .setTitle(`출석 완료! Day ${newStreak} 🔥`)
      .setDescription(
        `**${attendanceDay.toLocaleDateString("ko-KR")}** 출석 인정!\n\n` +
          `기본 보상: **${baseReward.toLocaleString()} 원**\n` +
          `연속 보너스: **${streakBonus.toLocaleString()} 원** (기본 보상의 30% × ${multiplier})\n\n` +
          `총 **${totalReward.toLocaleString()} 원** 받았어!`,
      )
      .addFields(
        {
          name: "현재 잔고",
          value: `${newMoney.toLocaleString()} 원`,
          inline: true,
        },
        {
          name: "연속 출석",
          value: `${newStreak}일째!`,
          inline: true,
        },
      )
      .setFooter({
        text:
          multiplier > 0
            ? `10일 단위 보너스 적용 중~ 내일도 화이팅!`
            : `10일 연속부터 보너스 시작!\n${new Date().toLocaleString(
                "ko-KR",
                {
                  timeZone: "Asia/Seoul",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                },
              )}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
};
