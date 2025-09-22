// src/_data/neighbourhoods.js
/*
  Returns an array of neighbourhood objects like:
  { slug, title, desc, about, hero, img, cardImg }
  If you later fetch from Google Sheets, wrap it in try/catch and return [] or a local JSON fallback.
*/
module.exports = async function () {
  try {
    // TODO: replace with your real fetch if/when needed
    // Example minimal seed so pages render:
    return [
      {
        slug: "alpine-trails",
        title: "Alpine Trails",
        desc: "Quiet, trail-forward living with views.",
        hero: "/img/neighbourhoods/alpine-trails.webp",
        cardImg: "/img/neighbourhoods/alpine-trails.webp",
        about: "<h3>Lifestyle</h3><p>Trail access, family-friendly, peaceful streets.</p>"
      },
      {
        slug: "riverside",
        title: "Riverside",
        desc: "Close to the Elk River and amenities.",
        hero: "/img/neighbourhoods/riverside.webp",
        cardImg: "/img/neighbourhoods/riverside.webp",
        about: "<h3>Location</h3><p>Walkable to town and river paths.</p>"
      }
    ];
  } catch (err) {
    console.warn("neighbourhoods data failed; returning empty []:", err);
    return [];
  }
};
