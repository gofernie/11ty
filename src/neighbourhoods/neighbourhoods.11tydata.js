// src/neighbourhoods/neighbourhoods.11tydata.js
// Goal: paginate ONLY the detail template (item.njk).
// index.njk must remain a single, non-paginated page at /neighbourhoods/.

const path = require("path");

module.exports = {
  // Pagination: only apply to item.njk
  pagination: (data) => {
    const inputPath = (data.page && data.page.inputPath) || "";
    const file = path.basename(inputPath);

    // Paginate only the detail template
    if (file === "item.njk") {
      return {
        data: "neighbourhoods",
        size: 1,
        alias: "row",
      };
    }

    // Disable pagination for everything else (e.g., index.njk)
    return false;
  },

  eleventyComputed: {
    // Permalinks: detail pages get /neighbourhoods/<slug>/, index is /neighbourhoods/
    permalink: (data) => {
      const inputPath = (data.page && data.page.inputPath) || "";
      const file = path.basename(inputPath);

      if (file === "item.njk" && data.row) {
        return `/neighbourhoods/${data.row.slug}/`;
      }

      if (file === "index.njk") {
        return "/neighbourhoods/";
      }

      // default (let the template decide)
      return data.permalink;
    },

    // Titles: use row.title on detail pages, keep existing on others
    title: (data) => (data.row ? data.row.title : data.title),
  },
};
