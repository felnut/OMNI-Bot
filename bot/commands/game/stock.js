const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const {
  buyStock,
  sellStock,
  STOCKS,
  createStockUpdateEmbed,
  createMyStocksEmbed,
  createStockNewsEmbed,
  createChartEmbed,
  getStocksForAutocomplete,
} = require("../../managers/stockManager");
const db = require("../../../Database");
const cache = require("../utils/cache");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("주식")
    .setDescription("서버 주식 거래소 (1시간 마다 시세 변동)")
    .addSubcommand((sub) =>
      sub.setName("주가").setDescription("현재 주가 확인"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("매수")
        .setDescription("주식 사기")
        .addStringOption((opt) =>
          opt
            .setName("종목")
            .setDescription("종목명 (입력 시 목록이 뜹니다)")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addIntegerOption((opt) =>
          opt
            .setName("수량")
            .setDescription("수량")
            .setRequired(true)
            .setMinValue(1),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("매도")
        .setDescription("주식 팔기")
        .addStringOption((opt) =>
          opt
            .setName("종목")
            .setDescription("종목명 (입력 시 목록이 뜹니다)")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addIntegerOption((opt) =>
          opt
            .setName("수량")
            .setDescription("수량")
            .setRequired(true)
            .setMinValue(1),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("내주식").setDescription("내 자산 확인"),
    )
    .addSubcommand((sub) =>
      sub.setName("랭킹").setDescription("서버 자산가 순위"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("뉴스")
        .setDescription("종목 뉴스 보기")
        .addStringOption((opt) => opt.setName("종목").setDescription("비워 두면 전체").setAutocomplete(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("차트")
        .setDescription("종목 차트 보기")
        .addStringOption((opt) =>
          opt.setName("종목").setDescription("종목명 (입력 시 목록이 뜹니다)").setRequired(true).setAutocomplete(true),
        ),
    ),

  async execute(interaction) {
    // DB 조회만 하므로 "생각 중…" 없이 계산 후 바로 응답한다 (각 분기에서 interaction.reply)
    const sub = interaction.options.getSubcommand();

    // ====================== 주가 확인 ======================
    if (sub === "주가") {
      const embed = createStockUpdateEmbed();
      return interaction.reply({ embeds: [embed] });
    }

    // ====================== 매수 / 매도 ======================
    if (sub === "매수" || sub === "매도") {
      const symbol = interaction.options.getString("종목");
      const qty = interaction.options.getInteger("수량");

      try {
        sub === "매수"
          ? buyStock(interaction.user.id, symbol, qty)
          : sellStock(interaction.user.id, symbol, qty);

        cache.invalidateMoney(interaction.user.id);

        const portfolioEmbed = createMyStocksEmbed(
          interaction.user.id,
          interaction.user.username,
        );

        return interaction.reply({
          content: `✅ **${STOCKS[symbol].name} ${sub} 완료!**`,
          embeds: [portfolioEmbed],
        });
      } catch (e) {
        return interaction.reply(`❌ ${e.message}`);
      }
    }
    // ====================== 내 주식 ======================
    if (sub === "내주식") {
      const embed = createMyStocksEmbed(interaction.user.id, interaction.user.username);
      return interaction.reply({ embeds: [embed] });
    }
    // ====================== 내 주식 ======================
    if (sub === "랭킹") {
      const users = await cache.getOrSet(
        "leaderboard:stock_value:top10",
        20000,
        async () =>
          db
            .prepare(
              `SELECT u.user_id, 
          COALESCE(SUM(us.shares * s.price), 0) as stock_value 
          FROM user u 
          LEFT JOIN user_stocks us 
          ON u.user_id = us.user_id 
          LEFT JOIN stocks s 
          ON us.symbol = s.symbol 
          GROUP BY u.user_id 
          HAVING stock_value > 0 
          ORDER BY stock_value DESC 
          LIMIT 10
      `,
            )
            .all(),
      );

      const embed = {
        color: 0xffd700, // 금색
        title: "🏆 서버 주식 보유액 랭킹 TOP 10 🏆",
        description: "실시간 보유 주식 평가액 순위",
        fields: [],
        footer: {
          text: "• 0원 보유자는 제외",
        },
        timestamp: new Date(),
      };

      if (users.length === 0) {
        embed.description = "아직 주식을 보유한 분이 없네요... 😅";
        embed.color = 0x7289da; // 블루로 살짝 변경
      } else {
        let rankingText = "";
        users.forEach((u, i) => {
          const rankEmoji =
            i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
          rankingText += `${rankEmoji} <@${u.user_id}> **${u.stock_value.toLocaleString()}원**\n`;
        });

        embed.fields.push({
          name: "순위",
          value: rankingText || "아직 데이터가 없어요",
          inline: false,
        });
      }

      return interaction.reply({ embeds: [embed] });
    }

    // ====================== 뉴스 / 손익 / 차트 ======================
    if (sub === "뉴스") {
      const symbol = interaction.options.getString("종목");
      if (symbol && !STOCKS[symbol]) return interaction.reply({ content: "❌ 존재하지 않는 종목입니다.", flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [createStockNewsEmbed(symbol)] });
    }
    if (sub === "차트") {
      const embed = createChartEmbed(interaction.options.getString("종목"));
      if (!embed) return interaction.reply({ content: "❌ 존재하지 않는 종목입니다.", flags: MessageFlags.Ephemeral });
      return interaction.reply({ embeds: [embed] });
    }
  },

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    if (focused.name !== "종목") return;

    const q = focused.value.trim().toLowerCase();
    const rows = getStocksForAutocomplete();
    const filtered = rows
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.symbol.toLowerCase().includes(q),
      )
      .slice(0, 25)
      .map((r) => ({
        name: `${r.name} (${r.symbol})`,
        value: r.symbol,
      }));

    await interaction.respond(filtered);
  },
};
