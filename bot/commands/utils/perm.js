const { PermissionFlagsBits } = require("discord.js");

/** 서버 소유자 또는 Administrator 권한자인지 (관리자 전용 명령어의 실행 확인에 공통 사용) */
function isServerAdmin(interaction) {
  return Boolean(
    interaction.guild?.ownerId === interaction.user.id ||
      interaction.memberPermissions?.has(PermissionFlagsBits.Administrator),
  );
}

module.exports = { isServerAdmin };
