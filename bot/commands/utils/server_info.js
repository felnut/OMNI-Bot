const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("서버정보").setDescription("이 서버의 정보를 보여줘요!").setDMPermission(false),

  async execute(interaction) {
    const g = interaction.guild;
    if (!g) return interaction.reply({ content: "❌ 서버 안에서만 사용할 수 있어요.", flags: MessageFlags.Ephemeral });
    const ts = (ms) => `<t:${Math.floor(ms / 1000)}:D>`;
    const embed = new EmbedBuilder()
      .setColor("#5865f2")
      .setTitle(`🏠 ${g.name}`)
      .setThumbnail(g.iconURL())
      .addFields(
        { name: "서버 ID", value: g.id, inline: true },
        { name: "소유자", value: `<@${g.ownerId}>`, inline: true },
        { name: "멤버", value: `${g.memberCount.toLocaleString()}명`, inline: true },
        { name: "채널", value: `${g.channels.cache.size}개`, inline: true },
        { name: "역할", value: `${g.roles.cache.size}개`, inline: true },
        { name: "부스트", value: `레벨 ${g.premiumTier} (${g.premiumSubscriptionCount ?? 0}명)`, inline: true },
        { name: "생성일", value: ts(g.createdTimestamp), inline: true },
      )
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  },
};
