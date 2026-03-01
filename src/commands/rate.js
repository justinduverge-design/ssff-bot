const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rate")
    .setDescription("Rate the last SSFF recommendation you received (0–10).")
    .addIntegerOption((opt) =>
      opt
        .setName("score")
        .setDescription("0–10 (your rating)")
        .setMinValue(0)
        .setMaxValue(10)
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const score = clamp(interaction.options.getInteger("score", true), 0, 10);

    if (!guildId) return interaction.editReply("❌ Use this in a server (not DMs).");

    // Update the most recent recommendation for this user in this server
    const last = db
      .prepare(
        `
        SELECT id, recommendation_text, created_at
        FROM recommendations
        WHERE guild_id = ? AND user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `
      )
      .get(guildId, userId);

    if (!last) {
      return interaction.editReply("No recommendation found yet. Run `/ssff` first.");
    }

    db.prepare(`UPDATE recommendations SET user_score = ? WHERE id = ?`).run(score, last.id);

    await interaction.editReply(`✅ Saved your rating: **${score}/10** for your last recommendation.`);
  },
};