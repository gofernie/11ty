// .eleventy.js
module.exports = function (eleventyConfig) {
  // Static assets
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addWatchTarget("src/components");

  // Layout aliases -> resolve to src/base.njk
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("base.njk", "base.njk");
  eleventyConfig.addLayoutAlias("layout/base.njk", "base.njk");

  // ---- Custom filters ----
  // Word snippet (avoid relying on Nunjucks split)
  eleventyConfig.addNunjucksFilter("snippet", function (str, count = 20) {
    if (!str) return "";
    const words = String(str).trim().split(/\s+/);
    const body = words.slice(0, count).join(" ");
    return body + (words.length > count ? "…" : "");
  });

  // Pills: CSV or array -> array
  eleventyConfig.addNunjucksFilter("pillsArray", function (val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean).map(s => String(s).trim()).filter(Boolean);
    return String(val).split(",").map(s => s.trim()).filter(Boolean);
  });

  // Robust slugify: from slug or title
  eleventyConfig.addNunjucksFilter("slugifySafe", function (val) {
    if (!val) return "";
    return String(val)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  return {
    dir: {
      input: "src",
      includes: ".",   // layouts/partials in src/
      layouts: ".",    // `layout: base.njk` -> src/base.njk
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
