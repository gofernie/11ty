// .eleventy.js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/css");

  // Allow both "base" and "base.njk" in front-matter
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("base.njk", "base.njk");
  // If any old pages still say layout: layout/base.njk, map that too
  eleventyConfig.addLayoutAlias("layout/base.njk", "base.njk");

  return {
    dir: {
      input: "src",
      includes: ".",     // <<< look in src/ for layouts/includes
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
