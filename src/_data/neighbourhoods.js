// _data/neighbourhoods.js
const { parse } = require("csv-parse/sync");

const SHEET_ID  = process.env.SHEET_ID  || "1SD2jDWJhxCyi5MXkCWW7o5WnbmXOvDFAxZlnBkx-8WI";
const SHEET_GID = process.env.SHEET_GID || "1029998690";
const CSV_URL   = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

module.exports = async function () {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  const csv = await res.text();

  const rows = parse(csv, { columns: true, skip_empty_lines: true })
    .map(r => Object.fromEntries(Object.entries(r).map(([k,v]) => [String(k).trim(), typeof v === "string" ? v.trim() : v])))
    .map(r => {
      const published = !/^(false|no|0)$/i.test(String(r.published ?? ""));
      const orderNum  = Number(r.order ?? 999);
      return { ...r, published, orderNum };
    })
    .filter(r => r.slug && r.published)
    .sort((a,b) => a.orderNum - b.orderNum);

  return rows;
};
