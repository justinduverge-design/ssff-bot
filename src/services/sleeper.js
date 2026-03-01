// src/services/sleeper.js
// Simple Sleeper API wrapper (no auth needed)
const BASE = "https://api.sleeper.app/v1";

async function sleeperGet(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Sleeper ${res.status} on ${path}: ${txt}`);
  }
  return res.json();
}

module.exports = {
  getLeague: (leagueId) => sleeperGet(`/league/${leagueId}`),
  getRosters: (leagueId) => sleeperGet(`/league/${leagueId}/rosters`),
  getUsers: (leagueId) => sleeperGet(`/league/${leagueId}/users`),
  getMatchups: (leagueId, week) => sleeperGet(`/league/${leagueId}/matchups/${week}`),
};