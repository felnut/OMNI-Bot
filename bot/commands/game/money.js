const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const db = require("../../../Database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("돈")
    .setDescription("현재 보유 금액을 확인합니다 💰"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // 생각 중... 표시

    // DB에서 유저 정보 가져오기
    let user = db
      .prepare("SELECT * FROM user WHERE user_id = ?")
      .get(interaction.user.id);

    // 처음 쓰는 유저면 자동 가입 (1000원 지급)
    if (!user) {
      db.prepare(
        `
        INSERT INTO user (user_id, money, daily_last_reset, streak)
        VALUES (?, ?, ?, ?)
      `,
      ).run(interaction.user.id, 1000, 0, 0);

      user = {
        user_id: interaction.user.id,
        money: 1000,
        daily_last_reset: 0,
        streak: 0,
      };
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`${interaction.user.username} 님의 지갑`)
      .setDescription(`💰 **${user.money.toLocaleString()} 원** 보유 중`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
