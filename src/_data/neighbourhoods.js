// src/_data/neighbourhoods.js  — uses Google "gviz" JSON (no deps)
// Maps your sheet's `img` column to `hero_image` so templates just work.

const SHEET_ID  = "1SD2jDWJhxCyi5MXkCWW7o5WnbmXOvDFAxZlnBkx-8WI";
const SHEET_GID = "1029998690";
const GVIZ_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&tqx=out:json`;

function gvizToArrayOfObjects(json) {
  const cols = json.table.cols.map(c => (c.label || c.id || "").trim());
  return json.table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      const key = cols[i] || `col${i}`;
      obj[key] = (cell && cell.v != null) ? String(cell.v).trim() : "";
    });
    return obj;
  });
}

const normalize = k => k.toLowerCase().replace(/\s+/g, "_");

module.exports = async function () {
  const res = await fetch(GVIZ_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  const text  = await res.text();
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  const data  = JSON.parse(text.slice(start, end + 1));

  const rows = gvizToArrayOfObjects(data)
    .map(r => {
      // normalize headers (e.g. "Hero Image" -> "hero_image")
      const n = {};
      for (const [k, v] of Object.entries(r)) n[normalize(k)] = v;

      // alias common names; YOUR sheet uses "img"
      const hero_image = n.hero_image || n.img || n.image || n.photo || "";

      const published = !/^(false|no|0)$/i.test(String(n.published ?? ""));
      const orderNum  = Number(n.order ?? 999);

      return {
        ...n,
        hero_image,   // <- templates use this
        published,
        orderNum
      };
    })
    .filter(r => (r.slug || "").trim() && r.published)
    .sort((a, b) => a.orderNum - b.orderNum);

  console.log("[neighbourhoods] loaded", rows.length, "rows from Google Sheets (gviz + img alias)");
  return rows;
};
