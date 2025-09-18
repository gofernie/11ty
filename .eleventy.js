const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // Copy /public to the site root
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // Responsive image shortcode (now includes 1080px)
  eleventyConfig.addNunjucksAsyncShortcode(
    "optimizedImage",
    async function (
      src,
      alt,
      widths = [480, 720, 1080, 1600],
      sizes = "(max-width: 1080px) 100vw, 1080px"
    ) {
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

  // Filters used in templates
  eleventyConfig.addNunjucksFilter("date", (input, format = "%Y") => {
    const d = input === "now" ? new Date() : new Date(input);
    if (["%Y", "YYYY", "yyyy"].includes(format)) return String(d.getFullYear());
    return d.toISOString();
  });

  eleventyConfig.addNunjucksFilter("split", (value, sep = ",") => {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    return String(value).split(sep).map(s => s.trim()).filter(Boolean);
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
