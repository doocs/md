const fs = require("fs");
const manifest = require("./src/manifest.json");
const package = require("./package.json");

switch (process.env.SERVER_ENV) {
  case 'NETLIFY':
    manifest.h5.publicPath = '/';
    package.main = 'main.js';
    break;
  case 'ELECTRON':
    manifest.h5.publicPath = '/';
    package.main = 'background.js';
    break;
  default:
    manifest.h5.publicPath = '/md/';
    package.main = 'main.js';
    break;
}

const result = JSON.stringify(manifest, null, 2);

fs.writeFile("./src/manifest.json", result, function (err) {
  if (err) {
    console.error(err);
  }
});
const packageRes = JSON.stringify(package, null, 2);

fs.writeFile("./package.json", packageRes, function (err) {
  if (err) {
    console.error(err);
  }
});
