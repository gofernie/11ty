const EleventyFetch = require("@11ty/eleventy-fetch");

// gviz JSON → rows
function gvizToRows(text) {
  const json = JSON.parse(text.replace(/^[\s\S]*setResponse\(/, "").replace(/\);\s*$/, ""));
  const cols = (json.table?.cols || []).map(c => (c.label || c.id || "").toLowerCase());
  return (json.table?.rows || []).map(r => {
    const obj = {};
    (r.c || []).forEach((cell, i) => obj[cols[i]] = cell && cell.v != null ? String(cell.v) : "");
    return obj;
  });
}

function slugify(s) {
  return String(s || "")
    .trim().toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// YOUR sheet
const SHEET_ID = "1D11GZExD-PfY3IcWPC3Xf9jxxUNlFuuSMCrMEGzySS0";
const GID = "1011805222";
const GVIZ = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

module.exports = async function () {
  const text = await EleventyFetch(GVIZ, { duration: "1h", type: "text" });

  const rows = gvizToRows(text).map(r => {
    const title = r.title || r.name || "";
    const slug  = slugify(r.slug || title);
    const hero  = r.img || r.hero || r.hero_image || "";
    const thumb = r.thumb || hero;
    const order = Number.parseFloat(r.order || "") || Number.POSITIVE_INFINITY;
    const publishedRaw = (r.published || "").trim().toLowerCase();
    const published = !publishedRaw || ["y","yes","true","1","publish","published"].includes(publishedRaw);

    return {
      slug,
      title,
      intro: r.desc || r.description || "",   // small lead under title/cards
      about: r.about || "",                   // can contain HTML
      hero_image: hero,
      thumb,
      tags: r.pills || r.tags || "",          // comma-separated
      order,
      published,
    };
  })
  // valid + published only
  .filter(r => r.slug && r.title && r.published)
  // sort by order then title
  .sort((a,b) => (a.order - b.order) || a.title.localeCompare(b.title));

  return rows;
};
