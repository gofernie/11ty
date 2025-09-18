module.exports = {
  pagination: {
    data: "neighbourhoods",
    size: 1,
    alias: "n",
  },
  permalink: (data) => {
    const slug = (data.n && data.n.slug) ? String(data.n.slug).trim() : "";
    const fallback = String(data.pagination && data.pagination.pageNumber || 0);
    return `/neighbourhoods/${slug || fallback}/`;
  },
  eleventyComputed: {
    title: (data) => data.n.title || data.n.name || "Neighbourhood",
    layout: "base.njk",
  },
};
