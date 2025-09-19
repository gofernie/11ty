// .eleventy.js
module.exports = function (eleventyConfig) {
  // Minimal Nunjucks "date" filter for our templates
  eleventyConfig.addNunjucksFilter("date", function (input, format = "yyyy") {
    // Accept "now", Date, timestamp, or date string
    const d =
      input === "now" || input === undefined || input === null
        ? new Date()
        : input instanceof Date
        ? input
        : new Date(input);

    // Only care about "yyyy" in our layout; provide a sane fallback
    if (format === "yyyy") return String(d.getFullYear());

    // Fallback formatting if someone passes another format
    // (kept simple to avoid extra packages)
    return d.toLocaleDateString("en-CA");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
    },
  };
};
