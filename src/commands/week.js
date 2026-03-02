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
      return interaction.editReply(
        `✅ NFL Week: **${state.leg || state.week || "unknown"}**`
      );
    } catch (e) {
      return interaction.editReply(`❌ Sleeper error: ${e.message}`);
    }
  },
};