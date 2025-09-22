// src/_data/neighbourhoods.js
// Replace this with your Google Sheets fetch later. Keep the shape the same.
module.exports = async function () {
  return [
    {
      slug: "alpine-trails",
      title: "Alpine Trails",
      desc: "Quiet, trail-forward living with views and larger lots.",
      hero: "/img/neighbourhoods/alpine-trails.webp",
      cardImg: "/img/neighbourhoods/alpine-trails.webp",
      pills: ["Trails", "Family", "Views", "Quiet", "Single-family"],
      about: "<h3>Lifestyle</h3><p>Alpine Trails offers peaceful streets with direct access to biking and hiking.</p>"
    },
    {
      slug: "riverside",
      title: "Riverside",
      desc: "Close to the Elk River and downtown amenities.",
      hero: "/img/neighbourhoods/riverside.webp",
      cardImg: "/img/neighbourhoods/riverside.webp",
      pills: ["Walkable", "River", "Convenient", "Parks", "Mixed homes"],
      about: "<h3>Location</h3><p>Minutes to town and riverside paths with a friendly, active vibe.</p>"
    }
  ];
};
