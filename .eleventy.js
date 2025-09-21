// .eleventy.js
module.exports = function (eleventyConfig) {
  // Copy images through to _site
  eleventyConfig.addPassthroughCopy("src/img");

  // Optional: allow both styles of referencing the base layout
  // So either `layout: base.njk` or `layout: layout/base.njk` will resolve.
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("layout/base.njk", "base.njk");

  return {
    dir: {
      input: "src",
      includes: "_includes",  // single includes dir
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
