export default function (eleventyConfig) {
  // Copy images, css, js and video as they are
  eleventyConfig.addPassthroughCopy("src/assets");

  // Every file in src/posts gets the tag "posts" (see src/posts/posts.json).
  // This collection is the same list, newest first.
  eleventyConfig.addCollection("postsNewest", (api) =>
    api.getFilteredByTag("posts").reverse()
  );

  // {{ post.date | ymd }}  ->  2026.10.24
  eleventyConfig.addFilter("ymd", (d) =>
    d.toISOString().slice(0, 10).replaceAll("-", ".")
  );
eleventyConfig.addFilter("rfc3339", (d) => new Date(d).toISOString());
eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
  };
}
