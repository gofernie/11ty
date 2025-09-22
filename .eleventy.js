module.exports = function (eleventyConfig) {
  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "layouts",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
