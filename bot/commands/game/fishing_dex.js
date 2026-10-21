const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const db = require("../../../Database");
const { FISH } = require("./fishing");
const { PROGRESS_MIN_BET } = require("../../managers/instantGame");

module.exports = {
  data: new SlashCommandBuilder().setName("낚시도감").setDescription("지금까지 잡은 물고기를 도감으로 확인해요"),

  async execute(interaction) {
    if (!db.prepare("SELECT 1 FROM user WHERE user_id = ?").get(interaction.user.id)) {
      return interaction.reply({ content: "먼저 `/돈`으로 가입해주세요!", flags: MessageFlags.Ephemeral });
    }
    const counts = new Map(
      db.prepare("SELECT fish, count FROM fish_log WHERE user_id = ?").all(interaction.user.id).map((r) => [r.fish, r.count]),
    );
    const caught = FISH.filter((f) => counts.has(f.name)).length;
    const lines = FISH.map((f) => {
      const n = counts.get(f.name);
      return n ? `${f.name} · **${n.toLocaleString()}마리** (${f.mult}배)` : "❔ 아직 못 잡았어요";
    });
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    const embed = new EmbedBuilder()
      .setColor(caught === FISH.length ? 0xffd700 : 0x3498db)
      .setTitle(`📖 ${interaction.user.username}님의 낚시 도감 (${caught}/${FISH.length})`)
      .setDescription(`${lines.join("\n")}\n\n총 **${total.toLocaleString()}마리**를 낚았어요${caught === FISH.length ? "\n🎉 도감을 모두 채웠어요!" : ""}`)
      .setFooter({ text: `미끼 ${PROGRESS_MIN_BET}원 이상으로 잡은 물고기만 도감에 기록돼요` });
    return interaction.reply({ embeds: [embed] });
  },
};
