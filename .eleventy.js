const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  // Copy /public to the site root
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // Responsive image shortcode
  eleventyConfig.addNunjucksAsyncShortcode(
    "optimizedImage",
    async function(src, alt, widths = [480, 800, 1200], sizes = "(max-width: 880px) 100vw, 880px") {
      if (!alt) throw new Error(`optimizedImage shortcode: missing alt for ${src}`);

      const metadata = await Image(src, {
        widths,
        formats: ["avif", "webp", "jpeg"],
        outputDir: "_site/img/",
        urlPath: "/img/",
      });

      const attrs = { alt, sizes, loading: "lazy", decoding: "async" };
      return Image.generateHTML(metadata, attrs);
    }
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
