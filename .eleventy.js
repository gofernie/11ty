// .eleventy.js
module.exports = function (eleventyConfig) {
  // Pass-through static assets
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  return {
    dir: {
      input: "src",
      includes: ".",     // look for layouts/includes directly in /src
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
