import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import packageJson from '../md-cli/package.json' assert { type: 'json' };
import child_process from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async function () {
  const execCommand = (arr) =>
    (Array.isArray(arr) ? arr : [arr]).forEach((c) => {
      try {
        console.log(`start: ${c}...`);
        console.log(child_process.execSync(c).toString("utf8"));
      } catch (error) {
        console.log("\x1B[31m%s\x1B[0m", error.stdout.toString());
        process.exit(1);
      }
    });
  const getNewVersion = (oldVersion, version = "patch") => {
    // [<newversion> | major | minor | patch]
    if (/^([0-9]+\.*)+$/.test(version)) return version;
    const types = ["major", "minor", "patch"];
    const index = types.indexOf(version);
    if (index >= 0) {
      const versionArr = oldVersion.split(".");
      versionArr[index] = Number(versionArr[index]) + 1;
      return versionArr.map((e, i) => (i > index ? 0 : e)).join(".");
    }
    return getNewVersion(oldVersion);
  };
  const newVersionObj = {
    version: getNewVersion(packageJson.version, process.argv[2]),
  };
  await fs.writeFile(
    path.resolve(__dirname, "../md-cli/package.json"),
    JSON.stringify(Object.assign({}, packageJson, newVersionObj), null, 2) +
      "\n"
  );
  console.log(newVersionObj);
  execCommand([
    `git commit -a -m 'chore: update version cli-v${newVersionObj.version}'`,
    `git tag cli-v${newVersionObj.version}`,
    "git push && git push --tags",
  ]);
  console.log("\x1B[32m%s\x1B[0m", "发布完成，请关注 GitHub CI 构建");
})();
