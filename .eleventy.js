// .eleventy.js
module.exports = function (eleventyConfig) {
  // Simple "date" filter, supports "now" -> "yyyy"
  eleventyConfig.addNunjucksFilter("date", function (input, format = "yyyy") {
    const d =
      input === "now" || input === undefined || input === null
        ? new Date()
        : input instanceof Date
        ? input
        : new Date(input);
    if (format === "yyyy") return String(d.getFullYear());
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
