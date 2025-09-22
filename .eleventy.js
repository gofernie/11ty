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

  return {
    dir: {
      input: "src",
      includes: ".",   // layouts/partials live directly in src/
      layouts: ".",    // so `layout: base.njk` maps to src/base.njk
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
