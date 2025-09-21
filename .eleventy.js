// .eleventy.js
module.exports = function (eleventyConfig) {
  // ✅ Copy everything from src/img → _site/img (so images work on Netlify)
  eleventyConfig.addPassthroughCopy("src/img");

  // ✅ Layout aliases: either layout: base.njk OR layout: layout/base.njk will work
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("layout/base.njk", "base.njk");

  return {
    dir: {
      input: "src",          // where your .njk pages live
      includes: "_includes", // where Eleventy looks for layouts/partials
      output: "_site",       // where the built site goes
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
