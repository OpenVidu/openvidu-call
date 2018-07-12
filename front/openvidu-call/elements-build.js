const fs = require('fs-extra');
const concat = require('concat');

if (process.argv.length != 3) {
    console.warn("Usage: npm run build:elements -- VERSION");
    console.warn('For example: "npm run build:elements -- 2.3.0"');
    process.exit(-1);
}
var VERSION = process.argv[2];

async function buildElement() {
  const files = [
    './dist/openvidu-call/runtime.js',
    './dist/openvidu-call/polyfills.js',
    './dist/openvidu-call/scripts.js',
    './dist/openvidu-call/main.js',
  ];

  try {
    await fs.ensureDir('elements');
    await concat(files, 'elements/openvidu-webcomponent-' + VERSION + '.js')
    await fs.copy('./dist/openvidu-call/styles.css', './elements/openvidu-webcomponent-' + VERSION + '.css');
  } catch (err) {
    console.error('Error executing build funtion in elements-builds.js', err);
  }
}

async function copyFiles() {
  const destination = '../../../openvidu-tutorials/openvidu-webcomponent/web';

  try {
    await fs.ensureDir('elements');
    await fs.copy('./elements/', destination);
  } catch (err) {
    console.error('Error executing copy function in elements-builds.js', err);
  }
}

async function removeElement() {
  try {
    await fs.ensureDir('elements');
    await fs.remove('./elements/');
  } catch (err) {
    console.error('Error executing remove function in elements-builds.js', err);
  }
}
buildElement()
  .then(() => {
    return copyFiles();
  })
  .then(() => {
    removeElement();
  });
