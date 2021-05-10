const fs = require('fs-extra');
const concat = require('concat');
const MODE = process.argv.slice(2)[0];
let VERSION = require('./package.json').version;
let PROJECT = 'openvidu-call';

module.exports.buildWebcomponent = async () => {
  let appModule = './src/app/app.module.ts';
  if (MODE === 'pro') {
    appModule = './projects/openvidu-call-pro/src/app/app.module.ts'
    PROJECT = 'openvidu-call-pro'
    VERSION = 'pro-' + VERSION;
  }
  console.log("Building OpenVidu Web Component (" + VERSION + ")");
  const tutorialWcPath = '../../openvidu-tutorials/openvidu-webcomponent/web';
  const e2eWcPath = '../webcomponent-test-e2e/web';

  try {
    await buildElement();
    // Only update tutorial if PRO
    if (MODE !== 'pro') {
      await copyFiles(tutorialWcPath);
      await copyFiles(e2eWcPath);
    }
    replaceText(appModule, "// bootstrap: [AppComponent]", "bootstrap: [AppComponent]");
    console.log('OpenVidu Web Component (' + VERSION + ') built');
  } catch (error) {
    replaceText(appModule, "// bootstrap: [AppComponent]", "bootstrap: [AppComponent]");
    console.error(error);
  }
}

async function buildElement() {
  const files = [
    `./dist/${PROJECT}/runtime.js`,
    `./dist/${PROJECT}/polyfills.js`,
    `./dist/${PROJECT}/scripts.js`,
    `./dist/${PROJECT}/main.js`,
  ];

  try {
    await fs.ensureDir('openvidu-webcomponent');
    await concat(files, './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.js')
    await fs.copy(`./dist/${PROJECT}/styles.css`, './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.css');
  } catch (err) {
    console.error('Error executing build function in webcomponent-builds.js');
    throw err;
  }
}

async function copyFiles(destination) {
  if (fs.existsSync(destination)) {
    try {
      console.log("Copying openvidu-webcomponent files from: ./openvidu-webcomponent to: " + destination);
      await fs.ensureDir('openvidu-webcomponent');
      await fs.copy('./openvidu-webcomponent/', destination);
    } catch (err) {
      console.error('Error executing copy function in webcomponent-builds.js');
      throw err;
    }
  }
}

function replaceText(file, originalText, changedText) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }
    let result = data.replace(originalText, changedText);

    fs.writeFile(file, result, 'utf8', (err) => {
      if (err) return console.log(err);
    });
  });

}

this.buildWebcomponent();
