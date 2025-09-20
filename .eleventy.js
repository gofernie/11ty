// .eleventy.js
module.exports = function (eleventyConfig) {
  // ✅ Copy CSS, images, JS (or any static assets) straight through to _site
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" }); // optional

  return {
    dir: {
      input: "src",
      includes: "_includes",        // ✅ correct
      layouts: "_includes/layouts",  // ✅ correct
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
