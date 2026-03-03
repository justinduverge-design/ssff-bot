const fetch = require("node-fetch"); // if you're using node-fetch
const BASE = "https://api.sleeper.app/v1";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sleeper ${res.status} on ${url.replace(BASE, "")}: ${text || "null"}`);
  }
  return res.json();
}

async function getUserByUsername(username) {
  const safe = encodeURIComponent(username);
  return getJson(`${BASE}/user/${safe}`);
}

async function getLeague(leagueId) {
  return getJson(`${BASE}/league/${leagueId}`);
}

async function getState() {
  return getJson(`${BASE}/state/nfl`);
}

async function getRosters(leagueId) {
  return getJson(`${BASE}/league/${leagueId}/rosters`);
}

async function getMatchups(leagueId, week) {
  return getJson(`${BASE}/league/${leagueId}/matchups/${week}`);
}

module.exports = {
  getUserByUsername,
  getLeague,
  getState,
  getRosters,
  getMatchups,
};