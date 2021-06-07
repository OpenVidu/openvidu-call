const fs = require('fs-extra');
const path = require('path');
const concat = require('concat');
const crypto = require('crypto');
const MODE = process.argv.slice(2)[0];
let VERSION = require('./package.json').version;
let PROJECT = 'openvidu-call';

module.exports.buildWebcomponent = async () => {
  let appModule = './src/app/app.module.ts';
  if (MODE === 'pro') {
    appModule = './projects/openvidu-call-pro/frontend/src/app/app.module.ts'
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
    } else {
      await copyFilesPro();
    }

    if (MODE != 'pro') {
      replaceText(appModule, "// bootstrap: [AppComponent]", "bootstrap: [AppComponent]");
      console.log('OpenVidu Call Web Component (' + VERSION + ') built');
    } else {
      replaceText(appModule, "// bootstrap: [AppProComponent]", "bootstrap: [AppProComponent]");
      console.log('OpenVidu Call Web Component PRO (' + VERSION + ') built');
    }

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

async function copyFilesPro() {
  // Update OpenVidu Call Pro Backend Files
  const openviduCallProResourcesPath = '../../openvidu-call-pro/backend/src/main/resources/static';
  const openviduCallProTargetPath = '../../openvidu-call-pro/backend/target/classes/static';
  const origWebComponentJsDir = './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.js';
  const origWebComponentCssDir = './openvidu-webcomponent/openvidu-webcomponent-' + VERSION + '.css';

  // Get hash of the webcomponent file to differentiate builds
  const webcomponentLibJsHash = hashFromFile(origWebComponentJsDir).substring(0, 10);
  const webcomponentCssHash = hashFromFile(origWebComponentCssDir).substring(0, 10);
  const hashedWebComponentJsDir = '/openvidu-webcomponent-' + VERSION + "-" + webcomponentLibJsHash + '.js';
  const hashedWebComponentCssDir = '/openvidu-webcomponent-' + VERSION + "-" + webcomponentCssHash + '.css';

  // Remove and copy new webcomponent builds
  await fs.ensureDir(openviduCallProResourcesPath);
  removeFilesWithPrefix(openviduCallProResourcesPath, 'openvidu-webcomponent-pro');
  console.log("Copying new file: ", openviduCallProResourcesPath + hashedWebComponentJsDir);
  await fs.copy(origWebComponentJsDir, openviduCallProResourcesPath + hashedWebComponentJsDir);
  console.log("Copying new file: ", openviduCallProResourcesPath + hashedWebComponentCssDir);
  await fs.copy(origWebComponentCssDir, openviduCallProResourcesPath + hashedWebComponentCssDir);
  await fs.ensureDir(openviduCallProTargetPath);
  removeFilesWithPrefix(openviduCallProTargetPath, 'openvidu-webcomponent-pro');
  console.log("Copying new file: ", openviduCallProTargetPath + hashedWebComponentJsDir);
  await fs.move(origWebComponentJsDir, openviduCallProTargetPath + hashedWebComponentJsDir);
  console.log("Copying new file: ", openviduCallProTargetPath + hashedWebComponentCssDir);
  await fs.move(origWebComponentCssDir, openviduCallProTargetPath + hashedWebComponentCssDir);
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

function hashFromFile(fileDir) {
  let file_buffer = fs.readFileSync(fileDir);
  let sum = crypto.createHash('sha256');
  sum.update(file_buffer);
  return sum.digest('hex');
}

function removeFilesWithPrefix(directory, prefix) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    if (file.startsWith(prefix)) {
      console.log("Removing old file: ", path.join(directory, file));
      fs.unlinkSync(path.join(directory, file));
    }
  }
}

this.buildWebcomponent();
