const fs = require('fs-extra');
const concat = require('concat');
const VERSION = require('./package.json').version;

// Fixed app-route bug: https://github.com/angular/angular/issues/24674
module.exports.prepareWebcomponent = function () {
  console.log("Preparing webcomponent files ...");
  const appModule = './src/app/app.module.ts';
  replaceText(appModule, "bootstrap: [AppComponent]", "// bootstrap: [AppComponent]");
}

module.exports.buildWebcomponent = async () => {
  console.log("Building OpenVidu Web Component (" + VERSION + ")");
  const tutorialWcPath = '../../openvidu-tutorials/openvidu-webcomponent/web';
  const e2eWcPath = '../webcomponent-test-e2e/web';

  try {
    await buildElement();
    await copyFiles(tutorialWcPath);
    await copyFiles(e2eWcPath);
    await restore();
    console.log('OpenVidu Web Component (' + VERSION + ') built');
  } catch (error) {
    replaceText(appModule, "// bootstrap: [AppComponent]", "bootstrap: [AppComponent]");
    console.error(error);
  }
}

async function buildElement() {
  const files = [
    './dist/openvidu-call/runtime.js',
    './dist/openvidu-call/polyfills.js',
    './dist/openvidu-call/scripts.js',
    './dist/openvidu-call/main.js',
  ];

  try {
    await fs.ensureDir('openvidu-webcomponent');
    await concat(files, './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.js')
    await fs.copy('./dist/openvidu-call/styles.css', './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.css');
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

async function restore() {
  const appModule = './src/app/app.module.ts';
  replaceText(appModule, "// bootstrap: [AppComponent]", "bootstrap: [AppComponent]");
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
