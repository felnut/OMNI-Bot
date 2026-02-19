const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("봇의 응답 속도와 API 지연 시간을 확인합니다."),

  async execute(interaction) {
    // 응답 지연, 후속 작업을 위해 일시 응답
    const response = await interaction.deferReply({ withResponse: true });

    // 메시지 지연(생성 시각 비교)
    const latency = response.resource.message.createdTimestamp - interaction.createdTimestamp;
    // 웹소켓 핑(봇-디스코드 간의 실시간 지연)
    const wsPing = interaction.client.ws.ping;
    const wsDisplay = wsPing === -1 ? `${latency}ms (예상)` : `${wsPing}ms`;

    // 임베드 생성
    const finalEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🏓 퐁!")
      .addFields(
        {
          name: "✉️ 메시지 지연 시간",
          value: `\`${latency}ms\``,
          inline: true,
        },
        {
          name: "⚙️ API 지연 시간",
          value: `\`${wsDisplay}\``,
          inline: true,
        }
      )

      .setTimestamp();

    // 임베드로 응답 편집
    await interaction.editReply({ embeds: [finalEmbed] });
  },
};