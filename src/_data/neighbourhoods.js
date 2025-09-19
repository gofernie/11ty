// Redirect-aware Google Sheets CSV fetcher for 11ty
const https = require("https");
const { URL } = require("url");

const MAX_REDIRECTS = 5;

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    console.log(`[neighbourhoods] Fetching: ${url}`);
    https
      .get(url, (res) => {
        const { statusCode, headers, statusMessage } = res;

        // Follow redirects (301/302/303/307/308)
        if ([301, 302, 303, 307, 308].includes(statusCode)) {
          const location = headers.location;
          if (!location) {
            reject(new Error(`Redirect (${statusCode}) with no Location header`));
            return;
          }
          if (redirects >= MAX_REDIRECTS) {
            reject(new Error(`Too many redirects. Last Location: ${location}`));
            return;
          }
          // Resolve relative redirects against the current URL
          const next = new URL(location, url).toString();
          console.log(`[neighbourhoods] Redirect ${statusCode} → ${next}`);
          res.resume(); // drain
          resolve(fetchText(next, redirects + 1));
          return;
        }

        if (statusCode !== 200) {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => {
            reject(new Error(`Sheets fetch failed: ${statusCode} ${statusMessage}\nBody: ${body.slice(0,300)}...`));
          });
          return;
        }

        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", (err) => reject(err));
  });
}

// Tiny CSV parser (handles quotes and escaped quotes)
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

const normalizeHeaders = (heads) => heads.map(h => String(h || "").trim().toLowerCase());

function toSlug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = async function () {
  const SHEET_ID = process.env.SHEET_ID || process.env.GOOGLE_SHEET_ID;
  const SHEET_GID = process.env.SHEET_GID || "";
  if (!SHEET_ID) {
    throw new Error("Missing SHEET_ID/GOOGLE_SHEET_ID env var. Set it in Netlify → Site configuration → Build & deploy → Environment variables.");
  }

  // Note: we intentionally use /pub?output=csv; Google may redirect → we follow it.
  const url = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv${SHEET_GID ? `&gid=${SHEET_GID}` : ""}`;

  const csv = await fetchText(url);
  const table = parseCSV(csv);
  if (!table.length) throw new Error("CSV parsed, but contained 0 rows. Is the sheet empty or not published as CSV?");

  const headers = normalizeHeaders(table[0]);
  const rows = table.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = String(r[i] ?? "").trim()));
    return obj;
  });

  // Expect: slug, title, desc, about, img, order, published, pills
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

  console.log(`[neighbourhoods] Loaded rows: ${cleaned.length}`);
  return cleaned;
};
