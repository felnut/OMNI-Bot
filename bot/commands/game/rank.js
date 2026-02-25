// bot/commands/game/ranking.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../../Database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("랭킹")
    .setDescription("서버에서 제일 돈 많은 사람들 TOP 10 💰"),

  async execute(interaction) {
    // TOP 10 가져오기
    const rankings = db
      .prepare(
        `
        SELECT user_id, money 
        FROM user 
        ORDER BY money DESC 
        LIMIT 10
      `,
      )
      .all();

    if (rankings.length === 0) {
      return interaction.reply(
        "아직 아무도 돈을 안 벌었네... 출석부터 박아보자 🔥",
      );
    }

    // 랭킹 문자열 만들기
    let desc = "";
    const medals = ["🥇", "🥈", "🥉"];

    rankings.forEach((r, i) => {
      const medal = medals[i] || `${i + 1}위`;
      desc += `${medal} <@${r.user_id}> **${r.money.toLocaleString()} 원**\n`;
    });

    const embed = new EmbedBuilder()
      .setColor(0xffd700) // 금색으로 럭셔리하게
      .setTitle("🏆 서버 돈 랭킹 TOP 10")
      .setDescription(desc)
      .setTimestamp();

    // 내 순위 계산 (동률도 정확히 처리)
    const myRow = db
      .prepare("SELECT money FROM user WHERE user_id = ?")
      .get(interaction.user.id);

    if (myRow) {
      const richer = db
        .prepare("SELECT COUNT(*) as cnt FROM user WHERE money > ?")
        .get(myRow.money).cnt;

      const myRank = richer + 1;

      embed.addFields({
        name: "📍 내 현재 순위",
        value: `**${myRank}위** - ${myRow.money.toLocaleString()} 원`,
        inline: false,
      });
    } else {
      embed.addFields({
        name: "📍 내 현재 순위",
        value: "아직 가입 안 했어요!\n`/돈` 한 번 쳐서 시작해~",
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
