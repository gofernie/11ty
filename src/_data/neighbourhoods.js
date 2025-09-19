// src/_data/neighbourhoods.js
const https = require("https");
const { parse } = require("csv-parse/sync");

// Use either a full published CSV URL or the 2PACX ID (+ optional gid)
const SHEET_URL = process.env.SHEET_URL || "";
const SHEET_ID  = process.env.SHEET_ID  || "";
const SHEET_GID = process.env.SHEET_GID || "";

function buildCsvUrl() {
  if (SHEET_URL) {
    try {
      const u = new URL(SHEET_URL.trim());
      const p = u.searchParams;
      p.set("output", "csv");
      p.set("single", "true");
      if (SHEET_GID) p.set("gid", SHEET_GID);
      p.set("cachebust", Date.now().toString());
      u.search = p.toString();
      return u.toString();
    } catch {
      /* fall through to ID mode */
    }
  }
  if (!SHEET_ID) return "";
  const gid = SHEET_GID ? `&gid=${encodeURIComponent(SHEET_GID)}` : "";
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?single=true${gid}&output=csv&cachebust=${Date.now()}`;
}

function fetchFollow(url, redirectsLeft = 5) {
  if (!url) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Netlify-Build/1.0 (+eleventy)",
        "Accept": "text/csv, */*;q=0.8",
      }
    }, (res) => {
      const { statusCode, headers } = res;
      const isRedirect = [301, 302, 303, 307, 308].includes(statusCode);
      if (isRedirect) {
        if (!headers.location) return reject(new Error(`Redirect with no Location header from ${url}`));
        if (redirectsLeft <= 0) return reject(new Error(`Too many redirects fetching ${url}`));
        const next = new URL(headers.location, url).toString();
        res.resume(); // drain
        return resolve(fetchFollow(next, redirectsLeft - 1));
      }

      if (statusCode < 200 || statusCode >= 300) {
        res.resume();
        return reject(new Error(`HTTP ${statusCode} from Google Sheets. URL: ${url}`));
      }

      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
  });
}

function isHtml(str = "") {
  const head = str.slice(0, 200).trim().toLowerCase();
  return head.startsWith("<!doctype html") || head.startsWith("<html");
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

  const text = await fetchFollow(url);

  if (isHtml(text)) {
    const preview = text.slice(0, 180).replace(/\s+/g, " ");
    throw new Error(
      `Expected CSV but got HTML. Check that the sheet is 'Published to the web' and the URL/ID is correct.\n` +
      `Requested: ${url}\nFirst 180 chars: ${preview}`
    );
  }

  const rows = parse(text, { columns: true, skip_empty_lines: true });

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
