const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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
    await interaction.deferReply({ ephemeral: true }); // prevents 3s timeout
    const leagueId = interaction.options.getString("league_id", true).trim();

    await interaction.editReply(
      `✅ Saved server league_id: **${leagueId}** (DB wiring next)`
    );
  },
};