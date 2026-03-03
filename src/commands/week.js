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
      const keys = Object.keys(state || {});
      const weekCandidates = {
        week: state?.week,
        display_week: state?.display_week,
        leg: state?.leg,
        season: state?.season,
        season_type: state?.season_type,
      };

      return interaction.editReply(
        `🧪 WEEK DEBUG\n` +
        `candidates: ${JSON.stringify(weekCandidates, null, 2)}\n` +
        `keys: ${keys.join(", ")}`
      );
    } catch (e) {
      return interaction.editReply(`❌ /week error: ${e.message}`);
    }
  },
};