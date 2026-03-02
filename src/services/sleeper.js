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

module.exports = {
  getUserByUsername,
  getLeague,
};