// .eleventy.js
module.exports = function (eleventyConfig) {
  // Copy images (so /img/... works after deploy)
  eleventyConfig.addPassthroughCopy("src/img");

  // If any old pages still say layout: layout/base.njk, map it to base.njk
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("layout/base.njk", "base.njk");

  return {
    dir: {
      input: "src",
      includes: ".",     // 👈 LOOK HERE INSTEAD OF _includes
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
