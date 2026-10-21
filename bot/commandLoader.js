// bot/commands 아래의 명령어 파일을 읽는다. index.js·deploy-commands.js·사이트 데이터 생성이 함께 쓴다.
// 묶음(bot/commandGroup.js)에 들어간 파일은 단독 명령어로 쓰지 않으므로 빼고 돌려준다.
const fs = require("node:fs");
const path = require("node:path");

function loadCommands(baseDir = path.join(__dirname, "commands")) {
  const all = [];
  for (const folder of fs.readdirSync(baseDir)) {
    const dir = path.join(baseDir, folder);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
      const mod = require(path.join(dir, file));
      if ("data" in mod && "execute" in mod) all.push(mod);
    }
  }
  const absorbed = new Set(all.flatMap((m) => m.absorbs ?? []));
  return all.filter((m) => !absorbed.has(m));
}

module.exports = { loadCommands };
