// .eleventy.js
module.exports = function (eleventyConfig) {
  // Copy images through to _site
  eleventyConfig.addPassthroughCopy("src/img");

  return {
    dir: {
      input: "src",
      includes: "_includes",   // ✅ single source of truth for layouts/partials
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
