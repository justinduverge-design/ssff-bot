const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setleague")
    .setDescription("Set the default Sleeper league_id for this server.")
    .addStringOption((opt) =>
      opt
        .setName("league_id")
        .setDescription("Sleeper league_id (numbers)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const leagueId = interaction.options.getString("league_id", true).trim();
    const guildId = interaction.guildId;

    if (!guildId) {
      return interaction.editReply("❌ This command must be used in a server (not DMs).");
    }

    const stmt = db.prepare(`
      INSERT INTO guild_settings (guild_id, league_id, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        league_id = excluded.league_id,
        updated_at = excluded.updated_at
    `);

    stmt.run(guildId, leagueId, Date.now());

    await interaction.editReply(`✅ Saved server league_id: **${leagueId}**`);
  },
};