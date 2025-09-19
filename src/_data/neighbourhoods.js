// src/_data/neighbourhoods.js
const https = require("https");
const { parse } = require("csv-parse/sync");

// Support either a full published CSV URL or just the 2PACX ID.
const SHEET_URL = process.env.SHEET_URL || "";           // full CSV URL ok
const SHEET_ID  = process.env.SHEET_ID  || "";           // just the 2PACX-... id
const SHEET_GID = process.env.SHEET_GID || "";           // optional

function buildCsvUrl() {
  // If user provided a full URL, normalize and return it.
  if (SHEET_URL) {
    // Accept both ".../pub?output=csv" and ".../pub?gid=...&single=true&output=csv"
    try {
      const u = new URL(SHEET_URL.trim());
      // Ensure output=csv is present
      const p = u.searchParams;
      p.set("output", "csv");
      // Optional but helps with multi-sheet: single=true + gid
      if (SHEET_GID) p.set("gid", SHEET_GID);
      p.set("single", "true");
      u.search = p.toString();
      return u.toString();
    } catch {
      // Fall through to ID mode if malformed
    }
  }

  // ID mode (preferred if you only paste the 2PACX id)
  if (!SHEET_ID) return "";
  const gidParam = SHEET_GID ? `&gid=${encodeURIComponent(SHEET_GID)}` : "";
  // This is the canonical published CSV format
  return `https://docs.google.com/spreadsheets/d/e/2PACX-1vTvU7gKNuEasTwqi-NksMwDqvP6-bA_kbZYA1k7wl-ZjNWlOHCJPPYOeSAX8F7BHSCcwlD-RKakcN9a/pub?output=csv`;
}

function fetchText(url) {
  if (!url) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const statusOk = res.statusCode >= 200 && res.statusCode < 300;
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (!statusOk) {
          return reject(
            new Error(`HTTP ${res.statusCode} from Google Sheets. URL: ${url}`)
          );
        }
        resolve(data);
      });
    }).on("error", reject);
  });
}

function isHtml(str = "") {
  const head = str.slice(0, 200).trim().toLowerCase();
  return head.startsWith("<!doctype html") || head.startsWith("<html");
}

function parseCsv(text) {
  return parse(text, { columns: true, skip_empty_lines: true });
}

function toSlug(s = "") {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

module.exports = async function () {
  const url = buildCsvUrl();
  if (!url) {
    console.warn("[neighbourhoods] No SHEET_URL or SHEET_ID set; returning empty list.");
    return [];
  }

  const raw = await fetchText(url);

  // Guard: Google sometimes returns an HTML interstitial if the sheet isn’t published or the URL is wrong.
  if (isHtml(raw)) {
    const preview = raw.slice(0, 180).replace(/\s+/g, " ");
    throw new Error(
      `Expected CSV but got HTML. Likely causes: sheet not 'Published to the web', wrong URL/ID, or private access. ` +
      `Check your Netlify env vars.\nRequested: ${url}\nFirst 180 chars: ${preview}`
    );
  }

  const rows = parseCsv(raw);

  const cleaned = (rows || [])
    .map((r) => {
      const title = r.title || r.Name || r.neighbourhood || r.Neighbourhood || "";
      const desc  = r.desc  || r.description || r.Description || "";
      const about = r.about || r.About || "";
      const pubRaw = (r.published ?? r.Published ?? "true").toString().toLowerCase();
      const published = !(pubRaw === "false" || pubRaw === "0" || pubRaw === "no");

      return {
        title,
        slug: r.slug ? String(r.slug).trim() : toSlug(title),
        desc,
        about,
        published,
      };
    })
    .filter((r) => r.title && r.slug && r.published);

  console.log("[neighbourhoods] Loaded rows:", cleaned.length);
  if (cleaned[0]) console.log("[neighbourhoods] First:", cleaned[0].title, "—", cleaned[0].desc);
  if (cleaned[1]) console.log("[neighbourhoods] Second:", cleaned[1].title, "—", cleaned[1].desc);

  return cleaned;
};
