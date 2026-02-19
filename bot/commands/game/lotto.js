const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");
const db = require("../../../Database");
const { getUserOrFail } = require("../utils/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("복권")
    .setDescription("500원으로 복권을 구매합니다.(꽝 없음)"),

  async execute(interaction) {
    const useFee = 500;

    const user = getUserOrFail(interaction, useFee);
    if (!user) return;

    // 이용료 차감
    db.prepare("UPDATE user SET money = money - ? WHERE user_id = ?").run(
      useFee,
      user.user_id,
    );
    user.money -= useFee; // 로컬 객체도 업데이트 (구매 시점 잔액 표시용)

    // 500원 단위로 당첨금 설정
    const amounts = Array.from({ length: 100 }, (_, i) => 500 * (i + 1));

    // 확률 설정 (금액 낮을수록 확률 높음)
    const weights = amounts.map((a) => 50000 / a);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // 가중치 적용해서 랜덤 만들기
    let rand = Math.random() * totalWeight;
    let sum = 0;
    let prize = 500; // 기본값 (안전장치)

    for (let i = 0; i < amounts.length; i++) {
      sum += weights[i];
      if (rand <= sum) {
        prize = amounts[i];
        break;
      }
    }

    // 구매 완료 임베드
    const buyEmbed = new EmbedBuilder()
      .setTitle("🎫 복권 구매 완료!")
      .setColor("#FFD700")
      .setDescription(
        "버튼을 눌러서 복권을 긁으세요!\n낮은 금액이 훨씬 잘 나와요~",
      )
      .addFields(
        {
          name: "🧾 결제 정보",
          value: `500원 차감\n잔액: ${user.money.toLocaleString()}원`,
          inline: true,
        },
        {
          name: "⏰ 제한 시간",
          value: "60초 안에 클릭해주세요. 자동 종료됩니다.",
          inline: true,
        },
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("draw_lotto")
        .setLabel("복권 긁기 🎫")
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      embeds: [buyEmbed],
      components: [row],
    });

    const message = await interaction.fetchReply();

    // 버튼 collector
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();

      const scratchingEmbed = new EmbedBuilder()
        .setTitle("🔥 복권 긁는 중...")
        .setColor("#FFAA00")
        .setDescription("두구두구...");

      await message.edit({
        embeds: [scratchingEmbed],
        components: [],
      });

      await new Promise((resolve) => setTimeout(resolve, 2500));

      // 당첨금 지급
      db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?").run(
        prize,
        user.user_id,
      );

      // 지급 후 최신 잔액 다시 조회
      const updatedUser = db
        .prepare("SELECT money FROM user WHERE user_id = ?")
        .get(user.user_id);
      const finalBalance = updatedUser.money;

      const resultEmbed = new EmbedBuilder()
        .setTitle("💰 당첨 결과")
        .setColor(prize >= 10000 ? "#00FF88" : "#88DDFF")
        .setDescription(`축하합니다! **${prize.toLocaleString()}원** 당첨!`)
        .addFields({
          name: "현재 잔액",
          value: `${finalBalance.toLocaleString()}원`,
          inline: true,
        });

      await message.edit({
        embeds: [resultEmbed],
        components: [],
      });

      collector.stop();
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?").run(
          useFee,
          user.user_id,
        );

        await interaction.editReply({
          content: "시간 초과로 취소되었습니다. 이용료는 반환됩니다.",
          embeds: [],
          components: [],
        });
      }
    });
  },
};
