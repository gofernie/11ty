// .eleventy.js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/css");

  // Pages can use `layout: base` or `layout: base.njk`
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("base.njk", "base.njk");
  // Safety for any old references:
  eleventyConfig.addLayoutAlias("layout/base.njk", "base.njk");

  return {
    dir: { input: "src", includes: ".", output: "_site" }, // look in src/ for layouts
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};

