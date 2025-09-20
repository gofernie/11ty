module.exports = function (eleventyConfig) {
  return {
    dir: {
      input: "src",
      includes: "_includes",        // ✅ correct
      layouts: "_includes/layouts",  // optional but explicit
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
