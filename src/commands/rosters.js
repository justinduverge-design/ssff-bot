const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");
const sleeper = require("../services/sleeper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rosters")
    .setDescription("Show all rosters in this league (owner + roster_id)."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    if (!guildId) return interaction.editReply("❌ Use this in a server, not DMs.");

    const row = db
      .prepare("SELECT league_id FROM guild_settings WHERE guild_id = ?")
      .get(guildId);

    if (!row?.league_id) return interaction.editReply("Run `/setleague` first.");

    try {
      const leagueId = row.league_id;
      const [rosters, users] = await Promise.all([
        sleeper.getRosters(leagueId),
        sleeper.getUsersInLeague(leagueId),
      ]);

      const userById = new Map(users.map((u) => [u.user_id, u]));

      // Sort by wins if available (some leagues may not have it in offseason)
      rosters.sort((a, b) => (b?.settings?.wins ?? 0) - (a?.settings?.wins ?? 0));

      const lines = rosters.map((r) => {
        const u = userById.get(r.owner_id);
        const name = u?.display_name || u?.username || r.owner_id;
        return `• **${name}** — roster_id: \`${r.roster_id}\``;
      });

      return interaction.editReply(
        `🏈 League rosters (${leagueId}):\n` + lines.slice(0, 30).join("\n")
      );
    } catch (e) {
      return interaction.editReply(`❌ rosters error: ${e.message}`);
    }
  },
};