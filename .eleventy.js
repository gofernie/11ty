// .eleventy.js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addWatchTarget("src/components"); // auto-reload when components change

  // allow both layout: base and layout: base.njk
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("base.njk", "base.njk");
  eleventyConfig.addLayoutAlias("layout/base.njk", "base.njk");

  return {
    dir: { input: "src", includes: ".", output: "_site" }, // 👈 includes live in src/
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
