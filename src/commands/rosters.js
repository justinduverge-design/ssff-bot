const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");
const sleeper = require("../services/sleeper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rosters")
    .setDescription("Show league rosters (name + roster_id)."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    if (!guildId) return interaction.editReply("❌ Use this in a server, not DMs.");

    const row = db
      .prepare("SELECT league_id FROM guild_settings WHERE guild_id = ?")
      .get(guildId);

    if (!row?.league_id) return interaction.editReply("❌ Run `/setleague` first.");

    try {
      const leagueId = row.league_id;

      const [rosters, users] = await Promise.all([
        sleeper.getRosters(leagueId),
        sleeper.getUsersInLeague(leagueId),
      ]);

      const userMap = new Map(users.map(u => [u.user_id, u.display_name || u.username || "Unknown"]));

      const lines = rosters
        .sort((a, b) => a.roster_id - b.roster_id)
        .map(r => {
          const name = r.owner_id ? (userMap.get(r.owner_id) || "Unknown") : "Open Slot";
          return `• **${name}** — roster_id: **${r.roster_id}**`;
        });

      return interaction.editReply(`🏈 League rosters (${leagueId}):\n${lines.join("\n")}`);
    } catch (e) {
      return interaction.editReply(`❌ rosters error: ${e.message}`);
    }
  },
};