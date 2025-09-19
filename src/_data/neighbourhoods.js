// src/_data/neighbourhoods.js
const https = require("https");
const { parse } = require("csv-parse/sync");

const SHEET_ID = process.env.SHEET_ID; // set in Netlify UI
const GID = process.env.SHEET_GID || "";

const CSV_URL = SHEET_ID
  ? `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv${GID ? `&gid=${GID}` : ""}&cachebust=${Date.now()}`
  : "";

function fetchCSV(url) {
  if (!url) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const rows = parse(data, { columns: true, skip_empty_lines: true });
          resolve(rows);
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function toSlug(s = "") {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

module.exports = async function() {
  const rows = await fetchCSV(CSV_URL);
  const cleaned = (rows || [])
    .map(r => ({
      title: r.title || r.Name || r.neighbourhood || "",
      slug: r.slug ? r.slug : toSlug(r.title || r.Name || ""),
      desc: r.desc || r.description || "",
      about: r.about || "",
      published: (r.published || r.Published || "").toString().toLowerCase() !== "false"
    }))
    .filter(r => r.title && r.slug && r.published);

  console.log("[neighbourhoods] Loaded rows:", cleaned.length);
  if (cleaned[0]) console.log("[neighbourhoods] First:", cleaned[0].title, "—", cleaned[0].desc);
  if (cleaned[1]) console.log("[neighbourhoods] Second:", cleaned[1].title, "—", cleaned[1].desc);

  return cleaned;
};
