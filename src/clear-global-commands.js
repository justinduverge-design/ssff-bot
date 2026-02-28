require("dotenv").config();
const { REST, Routes } = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Clearing GLOBAL commands...");
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log("✅ Global commands cleared.");
  } catch (err) {
    console.error(err);
  }
})();