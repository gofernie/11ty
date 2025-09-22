// .eleventy.js
module.exports = function (eleventyConfig) {
  // pass-thru static assets (optional, keeps your /img and /css paths stable)
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  return {
    dir: {
      input: "src",
      includes: ".",     // <-- look in src/ for layouts/includes
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
