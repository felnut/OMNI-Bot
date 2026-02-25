const db = require("../../../Database");
const { MessageFlags } = require("discord.js");

/**
 * 유저 조회 + 잔액 체크
 * → DB에 없으면 "먼저 /돈 명령어로 가입하세요" 메시지 띄우고 null 반환
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {number} requiredAmount 필요한 최소 금액 (0이면 잔액 체크 안 함)
 * @returns {Object|null} user 객체 또는 null
 */
function getUserOrFail(interaction, requiredAmount = 0) {
  const userId = interaction.user.id;

  // 유저 조회 (없으면 null)
  const user = db.prepare("SELECT * FROM user WHERE user_id = ?").get(userId);

  if (!user) {
    interaction
      .reply({
        content:
          "아직 돈 시스템에 가입 안 했어 ㅠㅠ\n먼저 `/돈` 쳐서 지갑 만들어!",
        flags: MessageFlags.Ephemeral,
      })
      .catch(() => {}); // 이미 응답된 경우 무시

    return null;
  }

  // 잔액 체크 (필요한 경우)
  if (requiredAmount > 0 && user.money < requiredAmount) {
    interaction
      .reply({
        content:
          `💸 돈 부족! (필요: ${requiredAmount.toLocaleString()}원, 현재: ${user.money.toLocaleString()}원)\n` /
          돈`으로 확인해봐~`,
        flags: MessageFlags.Ephemeral,
      })
      .catch(() => {});

    return null;
  }

  return user;
}

module.exports = {
  getUserOrFail,
};
