require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Map();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    console.log(`Loaded command: ${command.data.name}`);
  } else {
    console.log(`Skipped file (missing data/execute): ${file}`);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      // IMPORTANT: don't double-ack
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply("❌ Command not found.");
      }
      return interaction.reply({ content: "❌ Command not found.", ephemeral: true });
    }

    await command.execute(interaction);

  } catch (err) {
    console.error(err);

    const msg = "❌ There was an error executing this command.";
    // ✅ Only respond in a way that matches the current state
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply(msg).catch(() => {});
    }
    return interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
  }
});

client.login(process.env.DISCORD_TOKEN);
// --- Health server for Render ---
const http = require("http");
const PORT = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("ok");
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("SSFF bot running");
  })
  .listen(PORT, () => console.log(`Health server listening on ${PORT}`));