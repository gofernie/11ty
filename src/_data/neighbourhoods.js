// Fetches Google Sheet (published as CSV) -> Array of rows
// REQUIRED ENV: SHEET_ID (the long e/2PACX-... id without the "d/e/" prefix)
// OPTIONAL: SHEET_GID
// Example public CSV URL usually looks like:
// https://docs.google.com/spreadsheets/d/e/<SHEET_ID>/pub?output=csv&gid=<GID>

const https = require("https");

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Sheets fetch failed: ${res.statusCode} ${res.statusMessage}`));
          res.resume(); return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

// Tiny CSV parser that handles quoted commas and double quotes
function parseCSV(text) {
  const rows = [];
  let cell = "", row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { cell += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      row.push(cell); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (cell || row.length) { row.push(cell); rows.push(row); cell = ""; row = []; }
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function normalizeHeaders(heads) {
  return heads.map(h => String(h || "").trim().toLowerCase());
}

function toSlug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = async function () {
  const SHEET_ID = process.env.SHEET_ID || process.env.GOOGLE_SHEET_ID;
  if (!SHEET_ID) throw new Error("Missing SHEET_ID/GOOGLE_SHEET_ID");

  const gid = process.env.SHEET_GID || "";
  const url = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv${gid ? `&gid=${gid}` : ""}`;

  const csv = await fetchText(url);
  const table = parseCSV(csv);
  if (!table.length) return [];

  const headers = normalizeHeaders(table[0]);
  const rows = table.slice(1).map(r => {
    const o = {};
    headers.forEach((h, i) => (o[h] = String(r[i] ?? "").trim()));
    return o;
  });

  // Expected headers: slug, title, desc, about, img, order, published, pills
  // Tolerant fallback for missing slug
  const cleaned = rows.map(r => ({
    slug: r.slug || toSlug(r.title),
    title: r.title || "",
    desc: r.desc || "",
    about: r.about || "",
    img: r.img || "",
    order: Number(r.order || 9999),
    published: (r.published || "1").toString(),
    pills: r.pills || "",
  }))
  .filter(r => r.slug && r.title && r.published === "1")
  .sort((a, b) => a.order - b.order);

  return cleaned;
};
