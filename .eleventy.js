// .eleventy.js
module.exports = function (eleventyConfig) {
  // Copy assets
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/css");

  // Tell Eleventy where your base layout actually is
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");         // layout: base.njk
  eleventyConfig.addLayoutAlias("layout/base.njk", "layouts/base.njk"); // legacy path

  return {
    dir: { input: "src", includes: "_includes", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
