// .eleventy.js
module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksFilter("date", (input, format = "yyyy") => {
    const d = input === "now" || input == null ? new Date() : new Date(input);
    return format === "yyyy" ? String(d.getFullYear()) : d.toLocaleDateString("en-CA");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts", // <— keep this
      data: "_data",
    },
  };
};
