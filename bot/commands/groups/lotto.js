const { makeGroup } = require("../../commandGroup");

module.exports = makeGroup({
  name: "복권",
  description: "복권을 사서 긁어요",
  entries: [{ name: "구매", module: require("../game/lotto") }],
});
