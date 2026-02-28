const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const db = require("../../../Database");
const { getUserOrFail } = require("../utils/user");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("송금")
    .setDescription("다른 유저에게 돈을 보냅니다 📤")
    .addUserOption((option) =>
      option.setName("유저").setDescription("돈을 보낼 유저").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("금액")
        .setDescription("보낼 금액")
        .setRequired(true)
        .setMinValue(1),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags:MessageFlags.Ephemeral });

    const target = interaction.options.getUser("유저");
    const amount = interaction.options.getInteger("금액");

    // 자기 자신한테 송금 방지
    if (target.id === interaction.user.id) {
      return interaction.editReply({
        content: "자기 자신한테 송금은 안 돼 ㅋㅋㅋ",
        flags: 64,
      });
    }

    if (target.bot) {
      return interaction.editReply({
        content: "봇한테는 돈 못 보내 ㅋㅋ",
        flags: 64,
      });
    }

    let sender;
    try {
      sender = getUserOrFail(interaction, amount); // 송금자 체크
    } catch (err) {
      let content = "뭔가 잘못됐어 ㅠㅠ";
      if (err.message === "NOT_REGISTERED")
        content =
          "아직 돈 시스템에 가입 안 했어.\n먼저 `/돈` 쳐서 지갑 만들어!";
      else if (err.message === "INSUFFICIENT_MONEY")
        content = `💸 돈 부족! (필요: ${amount.toLocaleString()}원)`;
      return interaction.editReply({ content, flags:MessageFlags.Ephemeral });
    }

    let receiver = db
      .prepare("SELECT * FROM user WHERE user_id = ?")
      .get(target.id);

    if (!receiver) {
      return interaction.editReply({
        content: `${target} 님은 아직 가입 안 했어.\n상대방이 먼저 "/돈" 쳐야 송금 가능해!`,
        flags: 64,
      });
    }

    // 실제 송금 실행
    db.prepare("UPDATE user SET money = money - ? WHERE user_id = ?").run(
      amount,
      sender.user_id,
    );
    db.prepare("UPDATE user SET money = money + ? WHERE user_id = ?").run(
      amount,
      target.id,
    );

    const senderNew = sender.money - amount;
    const receiverNew = receiver.money + amount;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("송금 완료 💸")
      .setDescription(
        `${target} 님께 **${amount.toLocaleString()} 원** 을 보냈습니다!`,
      )
      .addFields(
        {
          name: "내 잔고",
          value: `${senderNew.toLocaleString()} 원`,
          inline: true,
        },
        {
          name: "받는 사람 잔고",
          value: `${receiverNew.toLocaleString()} 원`,
          inline: true,
        },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
