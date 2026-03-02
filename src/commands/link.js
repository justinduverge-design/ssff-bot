const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");
const sleeper = require("../services/sleeper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your Discord user to your Sleeper username.")
    .addStringOption((opt) =>
      opt
        .setName("sleeper_username")
        .setDescription("Your Sleeper username (case-insensitive).")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const discordUserId = interaction.user.id;
    const usernameInput = interaction.options
      .getString("sleeper_username", true)
      .trim();

    try {
      // Fetch Sleeper user by username
      const user = await sleeper.getUserByUsername(usernameInput);

      // Save/upsert link
      const stmt = db.prepare(`
        INSERT INTO user_links (discord_user_id, sleeper_user_id, sleeper_username, linked_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(discord_user_id) DO UPDATE SET
          sleeper_user_id = excluded.sleeper_user_id,
          sleeper_username = excluded.sleeper_username,
          linked_at = excluded.linked_at
      `);

      stmt.run(discordUserId, user.user_id, user.username, Date.now());

      return interaction.editReply(
        `✅ Linked you to Sleeper: **${user.username}** (id: \`${user.user_id}\`)`
      );
    } catch (e) {
      return interaction.editReply(`❌ Link failed: ${e.message}`);
    }
  },
};