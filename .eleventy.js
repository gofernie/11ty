// .eleventy.js
module.exports = function (eleventyConfig) {
  // Copy images straight through to _site
  eleventyConfig.addPassthroughCopy("src/img");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
