(async function () {
    const fs = require('fs');
    const path = require('path');
    const packageJson = require('../md-cli/package.json');
    const child_process = require('child_process');
      // 自动更新版本
  // version可以传递如 6.1.1 | patch | minor | major
  const execCommand = arr => (Array.isArray(arr) ? arr : [arr]).forEach(c => {
    try {
      console.log(`start: ${c}...`)
      console.log(child_process.execSync(c).toString('utf8'))
    } catch (error) {
      console.log('\x1B[31m%s\x1B[0m', error.stdout.toString())
      process.exit(1)
    }
  })
  const getNewVersion = (oldVersion, version = 'patch') => {
    // [<newversion> | major | minor | patch]
    if (/^([0-9]+\.*)+$/.test(version)) return version
    const types = ['major', 'minor', 'patch']
    const index = types.indexOf(version)
    if (index >= 0) {
      const versionArr = oldVersion.split('.')
      versionArr[index] = Number(versionArr[index]) + 1
      return versionArr.map((e, i) => i > index ? 0 : e).join('.')
    }
    return getNewVersion(oldVersion)
    }
    const newVersionObj = {
        version: getNewVersion(packageJson.version, process.argv[2]),
      };
      fs.writeFileSync(
        path.resolve(__dirname, '../md-cli/package.json'),
        JSON.stringify(Object.assign({}, packageJson, newVersionObj), null, 2) +
          '\n'
      );
      console.log(newVersionObj);
    execCommand([
        `git commit -a -m 'chore: update version cli-v${newVersionObj.version}'`,
        `git tag cli-v${newVersionObj.version}`,
        'git push && git push --tags',
      ])
      console.log('\x1B[32m%s\x1B[0m', '发布完成，请关注github CI构建')
}())
