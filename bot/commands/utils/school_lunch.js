const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("급식")
    .setDescription("급식을 알려줘요!")
    .addNumberOption((Option) =>
      Option.setName("year")
        .setDescription(
          "년도를 입력해주세요.(입력하지 않으면 현재 년도로 입력됩니다.)",
        )
        .setRequired(false),
    )
    .addNumberOption((Option) =>
      Option.setName("month")
        .setDescription(
          "월을 입력해주세요.(입력하지 않으면 현재 월로 입력됩니다.)",
        )
        .setRequired(false),
    )
    .addNumberOption((Option) =>
      Option.setName("day")
        .setDescription(
          "일을 입력해주세요.(입력하지 않으면 현재 일로 입력됩니다.)",
        )
        .setRequired(false),
    ),
  async execute(interaction) {
    try {
      const date = new Date();
      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth() + 1;
      const currentDay = date.getDate();

      const finalYear = interaction.options.getNumber("year") ?? currentYear;
      const finalMonth = String(interaction.options.getNumber("month") ?? currentMonth).padStart(2, "0");
      const finalDay = String(interaction.options.getNumber("day") ?? currentDay).padStart(2, "0");

      const response = await axios.get(
        `https://open.neis.go.kr/hub/mealServiceDietInfo`,
        {
          params: {
            KEY: process.env.NEIS_KEY,
            Type: "json",
            ATPT_OFCDC_SC_CODE: "B10",
            SD_SCHUL_CODE: "7011489",
            MLSV_YMD: `${finalYear}${finalMonth}${finalDay}`,
          },
        },
      );

      const data = response.data;

      if (data.mealServiceDietInfo) {
        const row = data.mealServiceDietInfo[1].row[0];
        const menu = row.DDISH_NM.split("<br/>")
          .join("\n")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/[0-9.()]/g, "")
          .trim();

        const mealEmbed = new EmbedBuilder()
          .setColor("#045195")
          .setTitle(`🍴 오늘의 메뉴`)
          .setAuthor({
            name: "단국대학교부속소프트웨어고등학교",
          })
          .setDescription(
            `**${row.MLSV_YMD.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}**\n`,
          )
          .addFields({
            name: "메뉴",
            value: `\`\`\`text\n${menu}\n\`\`\``,
            inline: false,
          })
          .setThumbnail(
            "https://cdn-icons-png.flaticon.com/512/3480/3480823.png",
          ) // 식판 아이콘
          .setTimestamp();

        await interaction.reply({ embeds: [mealEmbed] });
      } else {
        await interaction.reply(
          `📭 ${finalYear}-${finalMonth}-${finalDay}의 급식 정보가 없습니다.`,
        );
      }
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp("🚨 오류가 발생했습니다.");
      } else {
        await interaction.reply("🚨 급식을 불러오는 중에 오류가 발생했습니다.");
      }
    }
  },
};
