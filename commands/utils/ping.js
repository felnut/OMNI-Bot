const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping"),
  async execute(interaction) {
    await interaction.reply("퐁!", );
  },
};
