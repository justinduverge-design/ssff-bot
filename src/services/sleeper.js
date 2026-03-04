const BASE = "https://api.sleeper.app/v1";

async function getJson(path) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sleeper ${res.status} on ${url.replace(BASE, "")}: ${text || "null"}`);
  }

  return res.json();
}

async function getUserByUsername(username) {
  const safe = encodeURIComponent(username);
  return getJson(`/user/${safe}`);
}

async function getLeague(leagueId) {
  return getJson(`/league/${leagueId}`);
}

async function getState() {
  return getJson(`/state/nfl`);
}

async function getRosters(leagueId) {
  return getJson(`/league/${leagueId}/rosters`);
}

async function getMatchups(leagueId, week) {
  return getJson(`/league/${leagueId}/matchups/${week}`);
}

async function getUsersInLeague(leagueId) {
  return getJson(`/league/${leagueId}/users`);
}

module.exports = {
  getUserByUsername,
  getLeague,
  getState,
  getRosters,
  getMatchups,
  getUsersInLeague,
};