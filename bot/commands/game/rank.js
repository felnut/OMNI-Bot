const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../../Database");
const cache = require("../utils/cache");

const SCOPE_GUILD = "guild";
const SCOPE_GLOBAL = "global";

const stmtTopGlobal = db.prepare("SELECT user_id, money FROM user ORDER BY money DESC LIMIT 10");
const stmtTopGuild = db.prepare(
  `SELECT u.user_id, u.money FROM user u JOIN user_guild g ON g.user_id = u.user_id
   WHERE g.guild_id = ? ORDER BY u.money DESC LIMIT 10`,
);
const stmtMoney = db.prepare("SELECT money FROM user WHERE user_id = ?");
const stmtRicherGlobal = db.prepare("SELECT COUNT(*) AS cnt FROM user WHERE money > ?");
const stmtRicherGuild = db.prepare(
  `SELECT COUNT(*) AS cnt FROM user u JOIN user_guild g ON g.user_id = u.user_id
   WHERE g.guild_id = ? AND u.money > ?`,
);
const stmtInGuild = db.prepare("SELECT 1 FROM user_guild WHERE guild_id = ? AND user_id = ?");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("랭킹")
    .setDescription("돈 많은 사람들 TOP 10 💰 (현재 서버 / 전체 서버)")
    .addStringOption((o) =>
      o
        .setName("범위")
        .setDescription("순위를 볼 범위 (기본: 현재 서버)")
        .addChoices({ name: "현재 서버", value: SCOPE_GUILD }, { name: "전체 서버", value: SCOPE_GLOBAL }),
    ),

  async execute(interaction) {
    // 서버 밖(DM)에서는 현재 서버가 없으므로 전체 순위만 볼 수 있다
    const guildId = interaction.guildId;
    const scope = guildId ? (interaction.options.getString("범위") ?? SCOPE_GUILD) : SCOPE_GLOBAL;
    const isGuild = scope === SCOPE_GUILD;
    const key = isGuild ? `leaderboard:money:guild:${guildId}` : "leaderboard:money:global";

    const rankings = await cache.getOrSet(`${key}:top10`, 15000, async () =>
      isGuild ? stmtTopGuild.all(guildId) : stmtTopGlobal.all(),
    );

    if (rankings.length === 0) {
      return interaction.reply(
        isGuild
          ? "이 서버에는 아직 순위에 오른 사람이 없어요. 출석부터 해보세요! 🔥\n(`범위: 전체 서버`로 전체 순위를 볼 수 있어요)"
          : "아직 아무도 돈을 안 벌었네... 출석부터 해보세요! 🔥",
      );
    }

    const medals = ["🥇", "🥈", "🥉"];
    let desc = "";

    // 메달 + 유저 태그 + 금액 표시
    rankings.forEach((r, i) => {
      const medal = medals[i] || `${i + 1}위`;
      desc += `${medal} <@${r.user_id}> **${r.money.toLocaleString()} 원**\n`;
    });

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle(isGuild ? "🏆 현재 서버 돈 랭킹 TOP 10" : "🌐 전체 서버 돈 랭킹 TOP 10")
      .setDescription(desc)
      .setTimestamp();

    // ====================== 내 순위 추가 ======================
    const myRankInfo = await cache.getOrSet(`${key}:myRank:${interaction.user.id}`, 15000, async () => {
      const myRow = stmtMoney.get(interaction.user.id);
      if (!myRow) return null;
      if (isGuild && !stmtInGuild.get(guildId, interaction.user.id)) return { notInGuild: true };

      const richer = (isGuild ? stmtRicherGuild.get(guildId, myRow.money) : stmtRicherGlobal.get(myRow.money)).cnt;
      return { money: myRow.money, rank: richer + 1 };
    });

    if (!myRankInfo) {
      embed.addFields({
        name: "📍 내 현재 순위",
        value: "아직 가입 안 했어요!\n`/돈`을 먼저 입력하세요!",
        inline: false,
      });
    } else if (myRankInfo.notInGuild) {
      embed.addFields({
        name: "📍 내 현재 순위",
        value: "이 서버에서 아직 명령어를 쓰지 않았어요.\n이 서버에서 아무 명령어나 한 번 쓰면 순위에 포함돼요!",
        inline: false,
      });
    } else {
      embed.addFields({
        name: "📍 내 현재 순위",
        value: `**${myRankInfo.rank}위** - ${myRankInfo.money.toLocaleString()} 원`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
