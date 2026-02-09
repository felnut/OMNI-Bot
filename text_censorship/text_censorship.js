const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

function getFilter() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "filter.json"), "utf8");
    const json = JSON.parse(data);
    return json.Notext ? json.Notext : json;
  } catch (err) {
    console.error("Failed to read filter list : ", err);
    return {};
  }
}

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content) return;

    const filter = getFilter();
    let content = message.content;
    const cleanText = content.replace(
      /[\s\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g,
      "",
    );

    let isModified = false;
    let finalContent = content;

    for (const [replacement, badWords] of Object.entries(filter)) {
      for (const badWord of badWords) {
        if (content.includes(badWord) || cleanText.includes(badWord)) {
          const escapeWord = badWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          const regex = new RegExp(escapeWord, "g");

          finalContent = finalContent.replace(regex, replacement);
          isModified = true;
        }
      }
    }

    if (isModified) {
      try {
        if (message.deletable) {
          await message.delete();
        }

        const filterEmbed = new EmbedBuilder()
          .setColor(0x00ff7f)
          .setTitle("검열 딱!")
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL(),
          })
          .setDescription(`### ${finalContent}`)
          .setTimestamp();

        await message.channel.send({ embeds: [filterEmbed] });
      } catch (err) {
        console.error("Failed to process message : ", err);
      }
    }
  });
};
