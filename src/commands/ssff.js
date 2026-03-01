const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ssff")
    .setDescription("Get ONE most urgent move to help you win this week.")
    .addStringOption((opt) =>
      opt
        .setName("risk")
        .setDescription("How risky should the move be?")
        .addChoices(
          { name: "balanced", value: "balanced" },
          { name: "conservative", value: "conservative" },
          { name: "aggressive", value: "aggressive" }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const risk = interaction.options.getString("risk") || "balanced";

    if (!guildId) {
      return interaction.editReply("❌ Use this command in a server (not DMs).");
    }

    // 1) Read league_id from DB
    const settings = db
      .prepare("SELECT league_id FROM guild_settings WHERE guild_id = ?")
      .get(guildId);

    if (!settings?.league_id) {
      return interaction.editReply("No league_id saved yet. Run `/setleague` first.");
    }

    const leagueId = settings.league_id;

    // 2) STUB: generate a placeholder one-move recommendation
    // (We’ll replace this with Sleeper-based logic next.)
    const recommendation =
      risk === "conservative"
        ? "Make a safe floor play: swap your FLEX to the highest projected-volume RB/WR on your bench (avoid boom/bust)."
        : risk === "aggressive"
        ? "Swing for upside: pick up the highest-ceiling WR/RB on waivers and start them in FLEX if you’re projected to lose."
        : "Make the single best win-now move: use your FLEX on the best blend of floor+ceiling (start the player most likely to see the most touches/targets).";

    // 3) Scores (stubbed now, but structured how you want)
    const base = risk === "conservative" ? 65 : risk === "aggressive" ? 75 : 70;
    const modelScore = clamp(base, 0, 100);
    const conservativeScore = clamp(base - 5, 0, 100);
    const aggressiveScore = clamp(base + 10, 0, 100);

    // 4) Persist recommendation for auditing + anti-repetition
    db.prepare(
      `
      INSERT INTO recommendations (
        guild_id, user_id, league_id, command,
        recommendation_text, model_score,
        conservative_score, aggressive_score,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      guildId,
      userId,
      leagueId,
      "ssff",
      recommendation,
      modelScore,
      conservativeScore,
      aggressiveScore,
      Date.now()
    );

    // 5) Reply (one move + ask for rating)
    const msg =
      `**Your ONE move (${risk}):** ${recommendation}\n\n` +
      `**Confidence:** ${modelScore}/100 (Conservative ${conservativeScore}/100 • Aggressive ${aggressiveScore}/100)\n\n` +
      `**Did you use the recommendation? Was it the exact move?** Reply with \`/rate\` after (0–10).`;

    await interaction.editReply(msg);
  },
};