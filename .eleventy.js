// .eleventy.js
module.exports = function (eleventyConfig) {
  // Copy everything under src/img to /img in the output site
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });

  // Optional: passthrough a favicon or other static dirs if you have them
  // eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
