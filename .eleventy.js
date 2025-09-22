// .eleventy.js
module.exports = function (eleventyConfig) {
  // Static assets
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  // Shortcodes
  eleventyConfig.addNunjucksShortcode("year", () => new Date().getFullYear());

  return {
    dir: {
      input: "src",
      includes: ".",     // layouts/includes/components live directly in /src
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
