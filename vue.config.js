const fs = require("fs");
function writeManifestJson() {
  fs.readFile("./src/manifest.json", function (err, data) {
    if (err) {
      return console.error(err);
    }
    const strData = data.toString();
    const manifest = JSON.parse(strData);

    manifest.h5.publicPath =
      process.env.SERVER_ENV !== "NETLIFY" ? "/md/" : "/";
    const result = JSON.stringify(manifest, null, 2);

    fs.writeFile("./src/manifest.json", result, function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
}
writeManifestJson();
