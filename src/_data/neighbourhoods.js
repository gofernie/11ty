// src/_data/neighbourhoods.js
// Reads a Google Sheet (CSV or JSON) and normalizes rows for templates.
// Required ENV: GOOGLE_SHEET_URL  (CSV "output=csv" or a JSON endpoint)

const EleventyFetch = require("@11ty/eleventy-fetch");

// ---- tiny CSV parser (handles commas & quotes well enough for typical sheets)
function parseCSV(text) {
  const rows = [];
  let cur = "", row = [], inQ = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];

    if (c === '"' && inQ && n === '"') { cur += '"'; i++; continue; } // escaped quote
    if (c === '"') { inQ = !inQ; continue; }
    if (!inQ && c === ",") { row.push(cur); cur = ""; continue; }
    if (!inQ && (c === "\n" || c === "\r")) {
      if (cur.length || row.length) { row.push(cur); rows.push(row); }
      cur = ""; row = []; continue;
    }
    cur += c;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }

  const header = rows.shift()?.map(h => h.trim()) ?? [];
  return rows.map(r => {
    const o = {};
    header.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); });
    return o;
  });
}

// ---- image resolver
function resolveImgPath(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (/^https?:\/\//i.test(s) || s.startsWith("/")) return s; // already URL/path
  // treat as a filename within src/img/neighbourhoods/
  return `/img/neighbourhoods/${s}`;
}

// ---- core fetch
async function fetchRows() {
  const url = process.env.GOOGLE_SHEET_URL;
  if (!url) {
    throw new Error("Missing GOOGLE_SHEET_URL env var (CSV 'output=csv' or JSON).");
  }

  const body = await EleventyFetch(url, {
    duration: "10m", // cache to avoid hammering the sheet
    type: "text",    // we'll detect CSV/JSON ourselves
  });

  // detect format
  const isLikelyJson = body.trim().startsWith("{") || body.trim().startsWith("[");
  if (isLikelyJson) {
    return JSON.parse(body);
  }
  // else CSV
  return parseCSV(body);
}

module.exports = async function () {
  const rows = await fetchRows();

  // Normalize each row into a shape the templates can rely on
  const list = (rows || []).map(r => {
    // flexible field names: adjust as needed for your sheet columns
    const slug = String(r.slug || r.Slug || r.SLUG || "").trim().toLowerCase();
    const title = (r.title || r.Title || r.name || r.Name || slug.replace(/-/g, " ")).trim();
    const desc = r.desc || r.description || r.Description || "";
    const about = r.about || r.About || "";
    const pills = r.pills || r.Pills || ""; // CSV like "Trails, Quiet, Views"

    // *** THIS is the important part for your images ***
    // Uses the sheet column `img` if present; otherwise other fallbacks.
    const img_url = resolveImgPath(r.img || r.image || r.hero || r.photo);

    return { ...r, slug, title, desc, about, pills, img_url };
  }).filter(r => r.slug);

  // Sort by title by default (optional)
  list.sort((a, b) => a.title.localeCompare(b.title));

  return list;
};
