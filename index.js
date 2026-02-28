const envFile = process.argv.includes("--test") ? ".env.test" : ".env";
require("dotenv").config({ path: envFile, override: true });

const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// DB 자동 연결
require("./Database");

// 커맨드 핸들러
client.commands = new Collection();
const foldersPath = path.join(__dirname, "bot/commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const errorMsg = {
      content: "에러가 발생했습니다!",
      flags: [MessageFlags.Ephemeral],
    };
    if (interaction.replied || interaction.deferred)
      await interaction.followUp(errorMsg);
    else await interaction.editReply(errorMsg);
  }
});

client.once(Events.ClientReady, (c) =>
  console.log(`✅ 준비 완료! 계정: ${c.user.tag}`),
);

// deploy 함수 불러오기
const { deployCommands } = require("./deploy-commands");

async function start() {
  // --deploy 붙이면 자동 등록
  if (process.argv.includes("--deploy")) {
    console.log("🔄 커맨드 등록 시작합니다...");
    await deployCommands();
  }

  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (err) {
    console.error(err);
  }
}

start();
