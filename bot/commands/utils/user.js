const db = require("../../../Database");

/**
 * 유저 조회, 신규 등록, 잔액 조회
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {number} requiredAmount 게임 필요 최소 금액
 * @param {number} [initialMoney=1000] 신규 유저 시 초기 지급 금액
 * @returns {Object|null} user 객체 (성공 시) / null (잔액 부족하거나 에러)
 */
function getUserOrFail(interaction, requiredAmount, initialMoney = 1000) {
  const userId = interaction.user.id;

  // 유저 조회
  let user = db.prepare("SELECT * FROM user WHERE user_id = ?").get(userId);

  // 신규 생성
  if (!user) {
    db.prepare("INSERT INTO user(user_id, money) VALUES (?, ?)").run(
      userId,
      initialMoney,
    );
    user = { user_id: userId, money: initialMoney };
  }

  // 잔액 체크
  if (user.money < requiredAmount) {
    interaction
      .reply({
        content: `💸 잔액 부족! (필요: ${requiredAmount.toLocaleString()}원, 현재: ${user.money.toLocaleString()}원)`,
        ephemeral: true,
      })
      .catch(() => {}); // 이미 응답한 경우 무시

    return null;
  }

  return user;
}

module.exports = {
  getUserOrFail,
};
