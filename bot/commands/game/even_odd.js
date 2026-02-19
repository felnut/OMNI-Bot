const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../../Database");
const { getUserOrFail } = require("../utils/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("홀짝")
    .setDescription("이기면 2배, 지면 액수만큼 잃습니다.")
    .addStringOption((option) =>
      option
        .setName("선택")
        .setDescription("홀이나 짝을 선택하세요.")
        .setRequired(true)
        .addChoices(
          { name: "홀", value: "odd" },
          { name: "짝", value: "even" },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("금액")
        .setDescription("베팅할 금액을 입력하세요.")
        .setRequired(true)
        .setMinValue(1),
    ),

  async execute(interaction) {
    const choice = interaction.options.getString("선택");
    const bet = interaction.options.getInteger("금액");

    const user = getUserOrFail(interaction, bet);
    if (!user) return;

    // 게임 로직
    const resultNum = Math.floor(Math.random() * 10) + 1;
    const result = resultNum % 2 === 0 ? "even" : "odd";
    const resultKor = result === "even" ? "짝" : "홀";
    const playerKor = choice === "even" ? "짝" : "홀";
    const isWin = choice === result;

    // 이기면 배팅액 * 2
    const reward = isWin ? bet * 2 : -bet;

    // db 업데이트
    db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?").run(
      reward,
      user.user_id,
    );

    // 업데이트 후 최신 잔액 다시 조회
    const updatedUser = db
      .prepare("SELECT money FROM user WHERE user_id = ?")
      .get(user.user_id);
    const newBalance = updatedUser.money;

    // 결과 메시지
    const resultEmbed = new EmbedBuilder()
      .setColor(isWin ? 0x57f287 : 0xed4245)
      .setTitle(isWin ? "💰 승리!" : "💸 패배!")
      .addFields(
        {
          name: "─── 결과 ───",
          value: `\`나온 수: ${resultNum}(${resultKor})\`\n\`플레이어: ${playerKor}\``,
          inline: false,
        },
        {
          name: "─── 금액 ───",
          value: isWin
            ? `\`베팅: ${user.money.toLocaleString()}원 + 2×${bet.toLocaleString()}원\``
            : `\`베팅: ${user.money.toLocaleString()}원 -${bet.toLocaleString()}원\``,
          inline: false,
        },
        {
          name: "─── 총액 ───",
          value: `**현재 잔액: ${newBalance.toLocaleString()}원**`,
          inline: false,
        },
      );

    await interaction.reply({ embeds: [resultEmbed] });
  },
};
