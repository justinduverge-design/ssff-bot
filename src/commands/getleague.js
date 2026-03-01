const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getleague")
    .setDescription("Show the saved Sleeper league_id for this server."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    if (!guildId) return interaction.editReply("❌ Use this in a server, not DMs.");

    const row = db
      .prepare("SELECT league_id, updated_at FROM guild_settings WHERE guild_id = ?")
      .get(guildId);

    if (!row) return interaction.editReply("No league_id saved yet. Use `/setleague`.");

    const when = new Date(row.updated_at).toLocaleString();
    return interaction.editReply(`✅ League ID: **${row.league_id}**\nLast updated: ${when}`);
  },
};