const EleventyFetch = require("@11ty/eleventy-fetch");

const SHEET_ID = "1D11GZExD-PfY3IcWPC3Xf9jxxUNlFuuSMCrMEGzySS0";
const GID = "1011805222";
const GVIZ = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

const SAMPLE = [
  { slug: "montane",   title: "Montane",   intro: "Trails, modern homes, big nature." },
  { slug: "ridgemont", title: "Ridgemont", intro: "Close to town, great trail access." },
];

function slugify(s){ return String(s||"").trim().toLowerCase()
  .replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,""); }

function gvizToRows(text){
  const json = JSON.parse(text.replace(/^[\s\S]*setResponse\(/,"").replace(/\);\s*$/,""));
  const cols = (json.table?.cols||[]).map(c => (c.label || c.id || "").toLowerCase());
  return (json.table?.rows||[]).map(r => {
    const obj = {};
    (r.c||[]).forEach((cell,i)=> obj[cols[i]] = cell && cell.v!=null ? String(cell.v) : "");
    return obj;
  });
}

module.exports = async function () {
  try {
    const text = await EleventyFetch(GVIZ, { duration: "1h", type: "text" });
    const rows = gvizToRows(text)
      .map(r => ({ ...r, slug: slugify(r.slug || r.title || r.name) }))
      .filter(r => r.slug);

    // de-dupe
    const seen = new Set();
    const out = rows.filter(r => (seen.has(r.slug) ? false : (seen.add(r.slug), true)));

    console.log(`[neighbourhoods] loaded ${out.length} rows from Google Sheets`);
    return out.length ? out : SAMPLE;
  } catch (e) {
    console.warn("[neighbourhoods] fetch failed, using SAMPLE:", e.message || e);
    return SAMPLE;
  }
};
