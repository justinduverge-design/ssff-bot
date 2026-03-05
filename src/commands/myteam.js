const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");
const sleeper = require("../services/sleeper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("myteam")
    .setDescription("Show your roster (from your linked Sleeper account)."),

  async execute(interaction) {
    if (!interaction.deferred && !interaction.replied) {
  await interaction.deferReply({ ephemeral: true });
}

    const guildId = interaction.guildId;
    if (!guildId) return interaction.editReply("❌ Use this in a server (not DMs).");

    // 1) Must have league set for this server
    const leagueRow = db
      .prepare("SELECT league_id FROM guild_settings WHERE guild_id = ?")
      .get(guildId);

    if (!leagueRow?.league_id) {
      return interaction.editReply("❌ Run `/setleague` first.");
    }

    const leagueId = leagueRow.league_id;

    // 2) Must have user linked
    const discordUserId = interaction.user.id;
    const linkRow = db
      .prepare("SELECT sleeper_user_id, sleeper_username FROM user_links WHERE discord_user_id = ?")
      .get(discordUserId);

    if (!linkRow?.sleeper_user_id) {
      return interaction.editReply("❌ You’re not linked yet. Run `/link sleeper_username:<yourname>` first.");
    }

    const sleeperUserId = linkRow.sleeper_user_id;

    try {
      // 3) Fetch rosters + find your roster by owner_id
      const rosters = await sleeper.getRosters(leagueId);
      const myRoster = (rosters || []).find((r) => r.owner_id === sleeperUserId);

      if (!myRoster) {
        return interaction.editReply(
          `❌ Couldn’t find a roster for you in this league.\n` +
          `Linked Sleeper: ${linkRow.sleeper_username} (id: ${sleeperUserId})\n` +
          `League: ${leagueId}`
        );
      }

      const starters = myRoster.starters || [];
      const players = myRoster.players || [];
      const benchCount = Math.max(players.length - starters.length, 0);

      // MVP output (IDs now; names later)
      return interaction.editReply(
        `🏈 **My Team (MVP)**\n` +
        `League: **${leagueId}**\n` +
        `User: **${linkRow.sleeper_username}**\n` +
        `Roster ID: **${myRoster.roster_id}**\n\n` +
        `**Starters (${starters.length})**\n` +
        `${starters.length ? starters.join(", ") : "None"}\n\n` +
        `**Bench Count:** ${benchCount}\n` +
        `**Total Players:** ${players.length}`
      );
    } catch (e) {
      return interaction.editReply(`❌ myteam error: ${e.message}`);
    }
  },
};