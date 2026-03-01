const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");
const sleeper = require("../services/sleeper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leagueinfo")
    .setDescription("Test Sleeper: show league name + season."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    if (!guildId) return interaction.editReply("Use this in a server.");

    const row = db
      .prepare("SELECT league_id FROM guild_settings WHERE guild_id = ?")
      .get(guildId);

    if (!row?.league_id) return interaction.editReply("Run `/setleague` first.");

    try {
      const league = await sleeper.getLeague(row.league_id);
      return interaction.editReply(
        `✅ League: **${league.name}**\nSeason: **${league.season}** • Sport: **${league.sport}**`
      );
    } catch (e) {
      return interaction.editReply(`❌ Sleeper error: ${e.message}`);
    }
  },
};