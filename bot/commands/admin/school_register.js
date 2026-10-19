const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js");
const db = require("../../../Database");
const { isServerAdmin } = require("../utils/perm");
const { neisRows, getSchool } = require("../utils/neis");

const EPHEMERAL = MessageFlags.Ephemeral;
const stmtSet = db.prepare(
  `INSERT INTO guild_school (guild_id, atpt_code, school_code, school_name, school_kind, registered_by, registered_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(guild_id) DO UPDATE SET atpt_code = excluded.atpt_code, school_code = excluded.school_code,
     school_name = excluded.school_name, school_kind = excluded.school_kind,
     registered_by = excluded.registered_by, registered_at = excluded.registered_at`,
);
const stmtDel = db.prepare("DELETE FROM guild_school WHERE guild_id = ?");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("학교등록")
    .setDescription("[관리자 전용] 이 서버의 학교를 등록해요 (급식·시간표·학사일정에 사용)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 관리자에게만 보임
    .setDMPermission(false)
    .addSubcommand((s) =>
      s
        .setName("검색")
        .setDescription("학교 이름으로 찾아서 등록")
        .addStringOption((o) => o.setName("이름").setDescription("학교 이름 (예: 한빛고등학교)").setRequired(true).setMinLength(2).setMaxLength(30)),
    )
    .addSubcommand((s) => s.setName("확인").setDescription("현재 등록된 학교 보기"))
    .addSubcommand((s) => s.setName("해제").setDescription("학교 등록 지우기")),

  async execute(interaction) {
    if (!interaction.inGuild() || !isServerAdmin(interaction)) {
      return interaction.reply({ content: "❌ 서버 소유자 또는 관리자만 사용할 수 있어요.", flags: EPHEMERAL });
    }
    const sub = interaction.options.getSubcommand();

    if (sub === "확인") {
      const s = getSchool(interaction.guildId);
      return interaction.reply({ content: s ? `🏫 등록된 학교: **${s.name}** (${s.kind})` : "등록된 학교가 없어요. `/학교등록 검색`으로 등록해 주세요.", flags: EPHEMERAL });
    }
    if (sub === "해제") {
      const n = stmtDel.run(interaction.guildId).changes;
      return interaction.reply({ content: n ? "🗑️ 학교 등록을 지웠어요. 급식·시간표·학사일정은 다시 등록하기 전까지 쓸 수 없어요." : "등록된 학교가 없어요.", flags: EPHEMERAL });
    }

    // 검색 → 선택 → 등록
    const query = interaction.options.getString("이름").trim();
    await interaction.reply({ content: "🔎 학교를 찾는 중…", flags: EPHEMERAL });
    let rows;
    try {
      rows = await neisRows(null, "schoolInfo", { SCHUL_NM: query, pSize: 25 }, 10 * 60 * 1000);
    } catch (e) {
      console.error("학교 검색 오류:", e.message);
      return interaction.editReply("🚨 학교를 검색하는 중에 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    }
    rows = rows.filter((r) => ["초등학교", "중학교", "고등학교", "특수학교"].includes(r.SCHUL_KND_SC_NM)).slice(0, 25);
    if (!rows.length) {
      return interaction.editReply(`📭 "${query}"에 해당하는 학교가 없어요. 이름의 일부만 입력해 보세요. (초·중·고·특수학교만 지원)`);
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("school:pick")
      .setPlaceholder("등록할 학교를 선택하세요")
      .addOptions(
        rows.map((r, i) => ({
          label: r.SCHUL_NM.slice(0, 100),
          description: `${r.ATPT_OFCDC_SC_NM} · ${r.SCHUL_KND_SC_NM}${r.ORG_RDNMA ? ` · ${r.ORG_RDNMA}` : ""}`.slice(0, 100),
          value: String(i),
        })),
      );
    await interaction.editReply({ content: `🏫 "${query}" 검색 결과 ${rows.length}곳 — 선택하면 이 서버의 학교로 등록돼요.`, components: [new ActionRowBuilder().addComponents(menu)] });
    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60 * 1000,
      max: 1,
      filter: (i) => i.user.id === interaction.user.id,
    });
    collector.on("collect", async (i) => {
      const r = rows[Number(i.values[0])];
      if (!r) return;
      stmtSet.run(interaction.guildId, r.ATPT_OFCDC_SC_CODE, r.SD_SCHUL_CODE, r.SCHUL_NM, r.SCHUL_KND_SC_NM, interaction.user.id, Date.now());
      await i.update({ content: `✅ **${r.SCHUL_NM}** (${r.ATPT_OFCDC_SC_NM} · ${r.SCHUL_KND_SC_NM})을(를) 이 서버의 학교로 등록했어요!`, components: [] });
    });
    collector.on("end", async (collected) => {
      if (!collected.size) await interaction.editReply({ content: "⏱️ 시간이 지나서 취소됐어요.", components: [] }).catch(() => {});
    });
  },
};
