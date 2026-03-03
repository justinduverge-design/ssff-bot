const { SlashCommandBuilder } = require("discord.js");
const sleeper = require("../services/sleeper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("week")
    .setDescription("Show the current NFL week from Sleeper."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const state = await sleeper.getState();

      // show what we actually got back
      const keys = Object.keys(state || {}).join(", ");
      const week = state?.week ?? state?.display_week ?? state?.league_week ?? null;

      return interaction.editReply(
        `🧪 WEEK v2 running\n` +
        `season: **${state?.season ?? "unknown"}** (${state?.season_type ?? "unknown"})\n` +
        `week field: **${week ?? "MISSING"}**\n` +
        `keys: ${keys || "(none)"}`
      );
    } catch (e) {
      return interaction.editReply(`❌ WEEK v2 error: ${e.message}`);
    }
  },
};