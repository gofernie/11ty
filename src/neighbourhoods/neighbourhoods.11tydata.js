// Only paginate the detail page template (item.njk).
// Do NOT paginate index.njk, so it can output /neighbourhoods/ just once.

module.exports = {
  // Conditionally enable pagination only for item.njk
  pagination: data => {
    // Normalize the path for safety across environments
    const p = (data.page && data.page.inputPath) || "";
    // Adjust the endsWith check if your path differs
    if (p.endsWith("/src/neighbourhoods/item.njk")) {
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
    // Compute correct permalinks for each template:
    permalink: data => {
      const p = (data.page && data.page.inputPath) || "";

      // Detail pages from item.njk
      if (p.endsWith("/src/neighbourhoods/item.njk") && data.row) {
        return `/neighbourhoods/${data.row.slug}/`;
      }

      // The listing page (index.njk) stays at /neighbourhoods/
      if (p.endsWith("/src/neighbourhoods/index.njk")) {
        return "/neighbourhoods/";
      }

      // Fallback to whatever the template sets (or default behavior)
      return data.permalink;
    },

    // Optional: title for detail pages
    title: data => (data.row ? data.row.title : data.title),
  },
};
