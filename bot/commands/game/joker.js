const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const db = require("../../../Database.js");
const { getUserOrFail } = require("../utils/user.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("조커")
    .setDescription("조커 찾기 게임! 베팅 5만원으로 한 번 뽑아보자!"),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const betAmount = 50000;

    let user;
    try {
      user = getUserOrFail(interaction, betAmount);

      // 돈 차감
      db.prepare("UPDATE user SET money = money - ? WHERE user_id = ?").run(
        betAmount,
        interaction.user.id,
      );
      user.money -= betAmount;

      // 덱 생성 & 셔플
      const suits = ["♥", "♦", "♣", "♠"];
      const ranks = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ];
      let deck = [];
      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push(`${rank}${suit}`);
        }
      }
      deck.push("Joker");

      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      const card = deck.pop();

      // bank 정보 가져오기 (amount와 failed_attempts 둘 다)
      let bank = db.prepare("SELECT amount, failed_attempts FROM bank").get();
      if (!bank) {
        bank = { amount: 0, failed_attempts: 0 };
      }

      const embed = new EmbedBuilder()
        .setTitle("🃏 조커 찾기 결과")
        .setDescription(`뽑은 카드: **${card}**`)
        .addFields(
          {
            name: "현재 저금",
            value: `${bank.amount.toLocaleString()}원`,
            inline: true,
          },
          {
            name: "   실패 횟수",
            value: `${bank.failed_attempts}회`,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({ text: "저금은 계속 쌓여요!" });

      if (card === "Joker") {
        let prize = betAmount * 10;
        if (bank.amount > 0) {
          prize += bank.amount;
        }

        db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?").run(
          prize,
          interaction.user.id,
        );
        db.prepare("UPDATE bank SET amount = 0, failed_attempts = 0").run();

        embed.setColor("#00FF7F").addFields({
          name: "🎉 대박이다!!!",
          value: `조커 뽑음!\n상금 **${prize.toLocaleString()}원** 지급!\n저금 초기화됨`,
        });
      } else {
        const saveAmount = Math.floor(betAmount * 0.1);
        const newAmount = bank.amount + saveAmount;

        db.prepare(
          "UPDATE bank SET amount = amount + ?, failed_attempts = failed_attempts + 1",
        ).run(saveAmount);

        embed.setColor("#FF4500").addFields({
          name: "아... 꽝",
          value: " ",
        });
      }

      // 최종 잔액
      const updatedUser = db
        .prepare("SELECT money FROM user WHERE user_id = ?")
        .get(interaction.user.id);

      embed.addFields({
        name: "현재 잔액",
        value: `${updatedUser.money.toLocaleString()}원`,
        inline: true,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      let content = "에러가 발생했어! 나중에 다시 시도해 봐.";
      if (error.message === "NOT_REGISTERED") {
        content = '먼저 "/돈" 명령어로 가입하세요!';
      } else if (error.message === "INSUFFICIENT_MONEY") {
        const u = db
          .prepare("SELECT money FROM user WHERE user_id = ?")
          .get(interaction.user.id);
        content = `돈이 부족해! 필요 금액: ${betAmount.toLocaleString()}원\n보유: ${u?.money?.toLocaleString() || 0}원`;
      } else {
        console.error(error);
      }
      await interaction.editReply({ content, flags: MessageFlags.Ephemeral });
    }
  },
};
