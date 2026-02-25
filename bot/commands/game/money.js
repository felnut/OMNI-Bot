const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../../Database");
const { getUserOrFail } = require("../utils/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("돈")
    .setDescription("현재 보유 금액을 확인합니다 💰"),

  async execute(interaction) {
    let user = db
      .prepare("SELECT * FROM user WHERE user_id = ?")
      .get(interaction.user.id);

    if (!user) {
      db.prepare(
        `
      INSERT INTO user (user_id, money, daily_last_reset, streak)
      VALUES (?, ?, ?, ?)
    `,
      ).run(
        interaction.user.id, // user_id
        1000, // money
        0, // daily_last_reset
        0, // streak
      );

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

    await interaction.reply({ embeds: [embed] });
  },
};
