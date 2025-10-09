module.exports = function (eleventyConfig) {

// ---- Passthrough / Watch ----
 eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
 eleventyConfig.addPassthroughCopy("robots.txt");
 eleventyConfig.addPassthroughCopy("sitemap.xml"); // falls vorhanden
 eleventyConfig.addWatchTarget("src/assets/");  // <— richtiges Verzeichnis beobachten
 eleventyConfig.addWatchTarget("src/assets/img/referenzen-gewerbe");

 // Dev-Server
 eleventyConfig.setServerOptions({ port: 8888, showAllHosts: true });

 eleventyConfig.addFilter("isoDate", (dateInput = "now") => {
  const d = dateInput === "now" ? new Date() :
            dateInput instanceof Date ? dateInput : new Date(dateInput);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
});

 // ---- Filter ----
 // Datum
 eleventyConfig.addFilter("date", (dateInput, fmt = "dd.MM.yyyy") => {
 const d =
 dateInput === "now" ? new Date() :
 dateInput instanceof Date ? dateInput :
 new Date(dateInput);

 const pad = (n) => String(n).padStart(2, "0");

 if (fmt === "dd.MM.yyyy") {
 return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

 }

 return d.toLocaleDateString("de-DE");
 });

 // JSON (für JSON-LD etc.)
 eleventyConfig.addFilter("json", (value, spaces = 0) => {
 try { return JSON.stringify(value, null, spaces); }
 catch { return "null"; }
 });

 // Optional: Layout-Alias, wenn du "layout: base" schreiben willst
 eleventyConfig.addLayoutAlias("base", "base.njk");

 // ---- Directories / Engines ----
 return {
 dir: {

 input: "src",
 includes: "includes",
 data: "data",

 layouts: "_layouts",
 output: "_site",
},

templateFormats: ["njk", "html", "md"],
htmlTemplateEngine: "njk",
 dataTemplateEngine: "njk",
 };

};