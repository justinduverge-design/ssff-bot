const { SlashCommandBuilder } = require("discord.js");
const sleeper = require("../services/sleeper");

function seasonTypeLabel(t) {
  if (t === "regular") return "Regular Season";
  if (t === "post") return "Playoffs";
  if (t === "pre") return "Preseason";
  if (t === "off") return "Offseason";
  return t || "unknown";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("week")
    .setDescription("Show the current NFL week from Sleeper."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const state = await sleeper.getState();

      const season = state?.season ?? "unknown";
      const seasonType = state?.season_type ?? "unknown";
      const label = seasonTypeLabel(seasonType);

      // Sleeper uses 0 when no active week
      const activeWeek = Number(state?.leg ?? state?.week ?? 0);
      const displayWeek = Number(state?.display_week ?? 0);

      // If offseason (or 0 week), present it cleanly
      if (seasonType === "off" || activeWeek <= 0) {
        return interaction.editReply(
          `🏈 **${label}** (${season})\n` +
          `No active NFL week right now.\n` +
          (displayWeek > 0 ? `Next display week: **${displayWeek}**` : "")
        );
      }

      return interaction.editReply(
        `🏈 **${label}** (${season})\nCurrent NFL week: **${activeWeek}**`
      );
    } catch (e) {
      return interaction.editReply(`❌ /week error: ${e.message}`);
    }
  },
};