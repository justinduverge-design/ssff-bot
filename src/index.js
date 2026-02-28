require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
  console.log(`Loaded command: ${cmd.data.name}`);
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`➡️ Received /${interaction.commandName} from ${interaction.user.tag}`);

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log("❌ Command not found in collection");
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error("Command error:", err);
    // Try to respond safely even if something blew up
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: "❌ Error running command.", ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: "❌ Error running command.", ephemeral: true }).catch(() => {});
    }
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