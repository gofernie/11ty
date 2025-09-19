// src/_data/neighbourhoods.js  (no external deps)
const SHEET_ID  = "1SD2jDWJhxCyi5MXkCWW7o5WnbmXOvDFAxZlnBkx-8WI";
const SHEET_GID = "1029998690";

// gviz JSON endpoint
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&tqx=out:json`;

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

module.exports = async function () {
  const res = await fetch(GVIZ_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();

  // Strip gviz wrapper:  /*O_o*/\ngoogle.visualization.Query.setResponse(<json>);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const data = JSON.parse(text.slice(start, end + 1));

  const rows = gvizToArrayOfObjects(data)
    .map(r => {
      // normalize keys to match your templates: slug, title, description, about, hero_image, published, order, pills
      const normalize = (k) => k.toLowerCase().replace(/\s+/g, "_");
      const t = {};
      for (const [k, v] of Object.entries(r)) t[normalize(k)] = v;
      return t;
    })
    .map(r => {
      const published = !/^(false|no|0)$/i.test(String(r.published ?? ""));
      const orderNum = Number(r.order ?? 999);
      return { ...r, published, orderNum };
    })
    .filter(r => r.slug && r.published)
    .sort((a,b) => a.orderNum - b.orderNum);

  console.log("[neighbourhoods] loaded", rows.length, "rows from Google Sheets (gviz)");
  return rows;
};
