const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js");
const db = require("../../../Database");
const { getUserOrFail } = require("../utils/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("복권")
    .setDescription("500원으로 복권을 구매합니다.(꽝 없음)"),

  async execute(interaction) {
    await interaction.deferReply();

    const useFee = 500;

    let user;
    try {
      user = getUserOrFail(interaction, useFee);
    } catch (err) {
      let content = "뭔가 잘못됐어 ㅠㅠ";
      if (err.message === "NOT_REGISTERED")
        content =
          "아직 돈 시스템에 가입 안 했어 ㅠㅠ\n먼저 `/돈` 쳐서 지갑 만들어!";
      else if (err.message === "INSUFFICIENT_MONEY")
        content = `💸 돈 부족! (500원 필요해~)`;
      return interaction.editReply({ content, flags: MessageFlags.Ephemeral });
    }

    // 500원 차감
    db.prepare("UPDATE user SET money = money - ? WHERE user_id = ?").run(
      useFee,
      user.user_id,
    );
    user.money -= useFee;

    // 당첨금 랜덤 뽑기 (가중치 적용)
    const amounts = Array.from({ length: 100 }, (_, i) => 500 * (i + 1));
    const weights = amounts.map((a) => Math.pow(55000 / a, 1.87));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let rand = Math.random() * totalWeight;
    let sum = 0;
    let prize = 500;

    for (let i = 0; i < amounts.length; i++) {
      sum += weights[i];
      if (rand <= sum) {
        prize = amounts[i];
        break;
      }
    }

    // 구매 완료 메시지
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

    await interaction.editReply({ embeds: [buyEmbed], components: [row] });

    const message = await interaction.fetchReply();

    // 버튼 대기
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

      await message.edit({ embeds: [scratchingEmbed], components: [] });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 당첨금 지급
      db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?").run(
        prize,
        user.user_id,
      );

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

      await message.edit({ embeds: [resultEmbed], components: [] });
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
