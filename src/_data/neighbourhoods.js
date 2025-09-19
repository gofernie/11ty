const SHEET_ID  = "1SD2jDWJhxCyi5MXkCWW7o5WnbmXOvDFAxZlnBkx-8WI";
const SHEET_GID = "1029998690";
const GVIZ_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&tqx=out:json`;

const IMG_KEYS   = ["hero_image","image","img","photo","thumbnail","thumb","picture","hero"];
const TITLE_KEYS = ["title","name","neighbourhood","neighborhood"];
const DESC_KEYS  = ["description","blurb","summary","about_short"];

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
const normalizeKey = k => k.toLowerCase().replace(/\s+/g, "_");
const firstFilled = (obj, keys) => keys.map(k => obj[k]).find(v => v && String(v).trim()) || "";

module.exports = async function () {
  const res = await fetch(GVIZ_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  const data = JSON.parse(text.slice(start, end + 1));

  const rows = gvizToArrayOfObjects(data)
    .map(r => {
      // normalize keys
      const n = {};
      for (const [k,v] of Object.entries(r)) n[normalizeKey(k)] = v;

      // alias common headers
      const hero_image = firstFilled(n, IMG_KEYS);
      const title      = firstFilled(n, TITLE_KEYS);
      const description= firstFilled(n, DESC_KEYS);

      const published = !/^(false|no|0)$/i.test(String(n.published ?? ""));
      const orderNum  = Number(n.order ?? 999);

      return {
        ...n,
        hero_image,
        title,
        description,
        published,
        orderNum,
      };
    })
    .filter(r => (r.slug || "").trim() && r.published)
    .sort((a,b) => a.orderNum - b.orderNum);

  console.log("[neighbourhoods] loaded", rows.length, "rows from Google Sheets (gviz + aliases)");
  return rows;
};
